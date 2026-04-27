import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Button, Divider, Input, Select, Row, Col, Space, Tag, Alert } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { AddNewStudent } from '../components/Modals';
import { monthNames } from '../context/lists';
import {
    getStudentById,
    getLastEnrollmentByStudentId,
    registerEnrollment,
    getSectionByModule,
    getAllModules,
    getModulesByCourse,
    getApprovedModulesByStudent,
    getEnrollmentHistory,
    createStudentCohort,
    getActivePeriods,
    getEnrollmentCountBySection
} from '../client/client';

const Enrollments = () => {
    const { messageApi, contextHolder } = useContext(appContext);
    const { setView } = useContext(routerContext);

    // Modales
    const [addModal, setAddModal] = useState(false);

    // Datos del estudiante
    const [student, setStudent] = useState(null);
    const [studentType, setStudentType] = useState(null); // 'new' | 'regular' | 'repeating'
    const [lastEnrollment, setLastEnrollment] = useState(null);
    const [cohort, setCohort] = useState(null);
    const [enrollmentHistory, setEnrollmentHistory] = useState([]);

    // Selecciones del formulario
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);

    // Listas
    const [periodList, setPeriodList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [approvedModules, setApprovedModules] = useState([]);

    // Estados UI
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isModuleAlreadyApproved, setIsModuleAlreadyApproved] = useState(false);
    const [canEnroll, setCanEnroll] = useState(false);
    const [enrollmentCount, setEnrollmentCount] = useState(0);

    // Cargar periodos activos al montar
    useEffect(() => {
        loadActivePeriods();
    }, []);

    const loadActivePeriods = async () => {
        const res = await getActivePeriods();
        if (res.status === 200) {
            setPeriodList(res.data);
        }
    };

    // ============================================
    // BÚSQUEDA DEL ESTUDIANTE
    // ============================================
    async function searchStudent() {
        if (!searchValue) return;
        setLoading(true);
        resetForm();

        try {
            // 1. Intentar obtener última inscripción
            const res = await getLastEnrollmentByStudentId(Number(searchValue));

            if (res.status === 200 && res.data && res.data.length > 0) {
                // ESTUDIANTE CON HISTORIAL
                const lastData = res.data[0];
                setStudent({
                    id: lastData.studentId,
                    name: lastData.name,
                    lastname: lastData.lastname,
                    studentsIdentification: lastData.studentsIdentification,
                    email: lastData.email,
                    phone: lastData.phone,
                    photo: lastData.photo,
                    status: lastData.studentStatus
                });

                setLastEnrollment(lastData);
                setCohort({
                    id: lastData.cohortId,
                    courseId: lastData.courseId,
                    courseDescription: lastData.courseDescription,
                    sectionCode: lastData.sectionCode,
                    periodId: lastData.periodId
                });

                // Determinar tipo de estudiante
                if (lastData.gradeStatus === 'Reprobado') {
                    setStudentType('repeating');
                } else {
                    setStudentType('regular');
                }

                // Cargar historial completo y módulos aprobados
                const historyRes = await getEnrollmentHistory(lastData.studentId);
                if (historyRes.status === 200) {
                    setEnrollmentHistory(historyRes.data);
                }

                const approvedRes = await getApprovedModulesByStudent(lastData.studentId, lastData.courseId);
                if (approvedRes.status === 200) {
                    setApprovedModules(approvedRes.data);
                }

                // Cargar módulos del curso
                const modulesRes = await getModulesByCourse(lastData.courseId);
                if (modulesRes.status === 200) {
                    setModuleList(modulesRes.data);
                    determineDefaultModule(modulesRes.data, lastData, approvedRes.data || []);
                }

            } else {
                // ESTUDIANTE NUEVO (sin inscripciones previas)
                const res2 = await getStudentById(searchValue);
                if (res2.status === 200) {
                    const dataFinal = Array.isArray(res2.data) ? res2.data[0] : res2.data;
                    setStudent(dataFinal);
                    setStudentType('new');
                    setModuleList([]); // Se cargarán al seleccionar periodo
                } else {
                    messageApi.error('No se han encontrado estudiantes con esta cédula');
                }
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            messageApi.error('Hubo un error al conectar con el servidor');
        }
        setLoading(false);
    }

    // ============================================
    // DETERMINAR MÓDULO POR DEFECTO
    // ============================================
    const determineDefaultModule = (modules, lastData, approvedList) => {
        const sortedModules = [...modules].sort((a, b) => a.order - b.order);
        
        if (lastData.gradeStatus === 'Reprobado') {
            // REPITIENTE: por defecto el módulo reprobado
            const failedModule = sortedModules.find(m => m.id === lastData.moduleId);
            if (failedModule) {
                setSelectedModule(lastData.moduleId);
                loadSections(lastData.moduleId, lastData.sectionCode, lastData.periodId);
            }
        } else {
            // REGULAR: siguiente módulo en la secuencia
            const currentModuleIndex = sortedModules.findIndex(m => m.id === lastData.moduleId);
            const nextModule = sortedModules[currentModuleIndex + 1];
            
            if (nextModule) {
                setSelectedModule(nextModule.id);
                // Para regulares, auto-seleccionar sección con mismo código en periodo actual
                loadSections(nextModule.id, lastData.sectionCode, lastData.periodId);
            } else {
                // Último módulo completado
                messageApi.info('El estudiante ha completado todos los módulos del curso');
            }
        }
    };

    // ============================================
    // CARGAR SECCIONES
    // ============================================
    const loadSections = async (moduleId, sectionCode, periodId) => {
        if (!moduleId) return;
        
        const res = await getSectionByModule(moduleId, sectionCode, periodId);
        if (res.status === 200) {
            setSectionList(res.data);
            // Auto-seleccionar primera sección si hay disponibles
            if (res.data.length > 0) {
                setSelectedSection(res.data[0].id);
            }
        }
    };
    // ============================================
    // CONTADOR DE INSCRITOS POR SECCION
    // ============================================
    const loadEnrollmentCount = async (sectionId) => {
    if (!sectionId) {
        setEnrollmentCount(0);
        return;
    }
    const res = await getEnrollmentCountBySection(sectionId);
    if (res.status === 200) {
        setEnrollmentCount(res.data.count || 0);
    }
};

    // ============================================
    // MANEJADORES DE CAMBIO
    // ============================================
    const handlePeriodChange = async (periodId) => {
        setSelectedPeriod(periodId);
        setSelectedModule(null);
        setSelectedSection(null);
        setSectionList([]);
        
        if (studentType === 'new') {
            // Para estudiante nuevo, cargar módulos del periodo seleccionado
            // Nota: Aquí necesitarías saber qué curso ofrece ese periodo
            // Por ahora asumimos que getAllModules trae con courseid
            const allModulesRes = await getAllModules();
            if (allModulesRes.status === 200) {
                // Agrupar por curso y tomar el primero o permitir seleccionar curso
                const modules = allModulesRes.data;
                setModuleList(modules);
                // Auto-seleccionar módulo con order 1
                const firstModule = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0))[0];
                if (firstModule) {
                    setSelectedModule(firstModule.id);
                    loadSections(firstModule.id, null, periodId);
                }
            }
        }
    };

    const handleModuleChange = async (moduleId) => {
        setSelectedModule(moduleId);
        setSelectedSection(null);
        setIsModuleAlreadyApproved(false);

        // Verificar si ya aprobó este módulo
        if (student && approvedModules.includes(moduleId)) {
            setIsModuleAlreadyApproved(true);
            setCanEnroll(false);
            messageApi.warning('Este estudiante ya aprobó este módulo. No puede reinscribirlo.');
            return;
        }

        setIsModuleAlreadyApproved(false);

        if (studentType === 'new') {
            loadSections(moduleId, null, selectedPeriod);
        } else if (studentType === 'repeating') {
            // Repitiente puede cambiar de sección
            const sectionCode = lastEnrollment?.sectionCode;
            const periodId = selectedPeriod || lastEnrollment?.periodId;
            loadSections(moduleId, sectionCode, periodId);
        } else {
            // Regular: mantener mismo sectionCode
            const sectionCode = cohort?.sectionCode;
            const periodId = selectedPeriod || cohort?.periodId;
            loadSections(moduleId, sectionCode, periodId);
        }
    };

    const handleSectionChange = (sectionId) => {
        setSelectedSection(sectionId);
        loadEnrollmentCount(sectionId);
        validateEnrollment(selectedModule, sectionId);
    };

    const validateEnrollment = (moduleId, sectionId) => {
        if (!moduleId || !sectionId || !student) {
            setCanEnroll(false);
            return;
        }
        if (approvedModules.includes(moduleId)) {
            setCanEnroll(false);
            return;
        }
        setCanEnroll(true);
    };

    // ============================================
    // INSCRIPCIÓN
    // ============================================
    const Enrollment = async () => {
        if (!student || !selectedModule || !selectedSection) return;

        let cohortId = cohort?.id;
        let enrollmentType = 'Regular';
        let parentEnrollmentId = null;

        // Para estudiante nuevo, crear cohorte primero
        if (studentType === 'new') {
            if (!selectedPeriod) {
                messageApi.error('Debe seleccionar un periodo');
                return;
            }
            // Obtener courseId del módulo seleccionado
            const selectedModuleData = moduleList.find(m => m.id === selectedModule);
            const courseId = selectedModuleData?.courseid;
            
            if (!courseId) {
                messageApi.error('No se pudo determinar el curso del módulo');
                return;
            }

            const sectionData = sectionList.find(s => s.id === selectedSection);
            const cohortRes = await createStudentCohort({
                studentId: student.id,
                periodId: selectedPeriod,
                sectionCode: sectionData?.code,
                courseId: courseId
            });

            if (cohortRes.status !== 200) {
                messageApi.error('Error al crear la cohorte del estudiante');
                return;
            }
            cohortId = cohortRes.data.cohortId;
        }

        // Determinar si es repitiente
        if (studentType === 'repeating' && lastEnrollment?.moduleId === selectedModule) {
            enrollmentType = 'Repitiente';
            parentEnrollmentId = lastEnrollment?.enrollmentId;
        }

        const data = {
            studentId: student.id,
            sectionId: selectedSection,
            cohortId: cohortId,
            enrollmentType,
            parentEnrollmentId
        };

        setLoading(true);
        const res = await registerEnrollment(data);
        setLoading(false);

        if (res.status === 200) {
            messageApi.success("Inscripción realizada con éxito");
            setView('Enrollments');
        } else {
            messageApi.error(res.response?.data || "Error al inscribir");
        }
    };

    // ============================================
    // RESET
    // ============================================
    const resetForm = () => {
        setStudent(null);
        setStudentType(null);
        setLastEnrollment(null);
        setCohort(null);
        setEnrollmentHistory([]);
        setSelectedPeriod(null);
        setSelectedCourse(null);
        setSelectedModule(null);
        setSelectedSection(null);
        setModuleList([]);
        setSectionList([]);
        setApprovedModules([]);
        setIsModuleAlreadyApproved(false);
        setCanEnroll(false);
        setEnrollmentCount(0);
    };

    const cleanForm = () => {
        resetForm();
        setSearchValue("");
    };

    // ============================================
    // RENDER HELPERS
    // ============================================
    const Field = ({ label, value }) => (
        <div style={{ marginBottom: '16px', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{label}:</label>
            <Input value={value || ''} disabled style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
        </div>
    );

    const getModuleLabel = (module) => {
        return `${module.order ? `${module.order}. ` : ''}${module.description} (${module.evaluationMode})`;
    };

    // Determinar si mostrar selector de sección
    const showSectionSelector = useMemo(() => {
        if (!selectedModule) return false;
        if (studentType === 'new') return true;
        if (studentType === 'repeating' && lastEnrollment?.moduleId === selectedModule) return true;
        if (studentType === 'regular') return sectionList.length > 1; // Solo si hay múltiples opciones
        return true;
    }, [studentType, selectedModule, lastEnrollment, sectionList]);

    return (
        <div className='NewEnrollment Page'>
            <Divider className="PageTitle"><h1>Inscripción</h1></Divider>
            {contextHolder}

            {/* Barra de búsqueda */}
            <div className="searchBar" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <Input
                    placeholder="Buscar estudiante por cédula"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onPressEnter={searchStudent}
                />
                <Button type="primary" onClick={searchStudent} loading={loading}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar Nuevo</Button>
            </div>

            <div className="listContainer Content Enrollments" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Sin estudiante seleccionado */}
                {!student && (
                    <h3 style={{ textAlign: 'center' }}>Ingrese la cédula del estudiante a inscribir</h3>
                )}

                {/* Datos del estudiante */}
                {student && (
                    <>
                        {/* Indicador de tipo */}
                        <div style={{ marginBottom: '16px' }}>
                            {studentType === 'new' && <Tag color="blue">Nuevo Ingreso</Tag>}
                            {studentType === 'regular' && <Tag color="green">Estudiante Regular</Tag>}
                            {studentType === 'repeating' && <Tag color="orange">Repitiente</Tag>}
                        </div>

                        <div className="student-info-grid">
                            <Row gutter={[24, 0]}>
                                <Col span={8}><Field label="Nombre" value={student.name} /></Col>
                                <Col span={8}><Field label="Apellido" value={student.lastname} /></Col>
                                <Col span={8}><Field label="Cédula" value={student.studentsIdentification} /></Col>
                                <Col span={8}><Field label="Email" value={student.email} /></Col>
                                <Col span={8}><Field label="Teléfono" value={student.phone} /></Col>
                                <Col span={8}><Field label="Estado" value={student.status} /></Col>
                            </Row>

                            {/* Info de última inscripción */}
                            {lastEnrollment && (
                                <Row gutter={[24, 0]}>
                                    <Col span={8}><Field label="Último Módulo" value={lastEnrollment.moduleDescription} /></Col>
                                    <Col span={8}><Field label="Sección" value={lastEnrollment.sectionCode} /></Col>
                                    <Col span={8}><Field label="Periodo" value={`${monthNames[lastEnrollment.period - 1]} - ${lastEnrollment.year}`} /></Col>
                                    <Col span={8}><Field label="Modalidad" value={lastEnrollment.modality} /></Col>
                                    <Col span={8}><Field label="Nota Final" value={lastEnrollment.score ?? 'Sin nota'} /></Col>
                                    <Col span={8}><Field label="Estatus" value={
                                        <Tag color={lastEnrollment.gradeStatus === 'Aprobado' ? 'green' : lastEnrollment.gradeStatus === 'Reprobado' ? 'red' : 'default'}>
                                            {lastEnrollment.gradeStatus}
                                        </Tag>
                                    } /></Col>
                                </Row>
                            )}
                        </div>

                        <Divider />

                        {/* Área de acción */}
                        <div className='action-area' style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                            
                            {/* Selector de Periodo (solo para nuevos) */}
                            {studentType === 'new' && (
                                <Select
                                    placeholder="Seleccione un Periodo"
                                    value={selectedPeriod || undefined}
                                    onChange={handlePeriodChange}
                                    options={periodList.map(p => ({
                                        value: p.id,
                                        label: `${monthNames[p.period - 1]} - ${p.year} (${p.modality})`
                                    }))}
                                    style={{ width: '100%' }}
                                />
                            )}

                            {/* Selector de Módulo */}
                            <Select
                                placeholder="Seleccione un Módulo"
                                value={selectedModule || undefined}
                                onChange={handleModuleChange}
                                options={moduleList.map(m => ({
                                    value: m.id,
                                    label: getModuleLabel(m)
                                }))}
                                style={{ width: '100%' }}
                                disabled={studentType === 'new' && !selectedPeriod}
                            />

                            {/* Alerta si el módulo ya fue aprobado */}
                            {isModuleAlreadyApproved && (
                                <Alert
                                    message="Módulo ya cursado"
                                    description="Este estudiante ya aprobó este módulo y no puede reinscribirlo."
                                    type="warning"
                                    showIcon
                                />
                            )}

                            {/* Selector de Sección */}
                            {selectedModule && showSectionSelector && (
                                <>
                                    <Select
                                        placeholder="Seleccione una Sección"
                                        value={selectedSection || undefined}
                                        onChange={handleSectionChange}
                                        options={sectionList.map(s => ({
                                            value: s.id,
                                            label: `Sección ${s.code} - ${monthNames[s.period - 1]} ${s.year} (${s.modality})`
                                        }))}
                                        style={{ width: '100%' }}
                                    />
                                    
                                    {/* CONTADOR DE INSCRITOS - NUEVO */}
                                    {selectedSection && (
                                        <div style={{ 
                                            padding: '8px 12px', 
                                            background: '#e6f7ff', 
                                            border: '1px solid #91d5ff', 
                                            borderRadius: '4px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span>
                                                <strong>Inscritos:</strong> {enrollmentCount}
                                            </span>
                                            {sectionList.find(s => s.id === selectedSection)?.quota && (
                                                <span style={{ color: enrollmentCount >= sectionList.find(s => s.id === selectedSection).quota ? '#ff4d4f' : '#52c41a' }}>
                                                    <strong>Cupo:</strong> {sectionList.find(s => s.id === selectedSection).quota} 
                                                    {' '}(Disponible: {Math.max(0, sectionList.find(s => s.id === selectedSection).quota - enrollmentCount)})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Info de sección auto-seleccionada (para regulares) */}
                            {studentType === 'regular' && selectedSection && sectionList.length === 1 && (
                                <div style={{ padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                                    Sección asignada: <strong>{sectionList[0]?.code}</strong> (mismo código de cohorte)
                                </div>
                            )}

                            <Space>
                                <Button
                                    type="primary"
                                    onClick={Enrollment}
                                    disabled={!canEnroll || loading}
                                >
                                    Inscribir
                                </Button>
                                <Button onClick={cleanForm}>
                                    Cancelar
                                </Button>
                            </Space>
                        </div>
                    </>
                )}
            </div>

            <div className="EmptyFooter" style={{ height: '50px' }} />

            <AddNewStudent
                open={addModal}
                onCancel={() => setAddModal(false)}
            />
        </div>
    );
};

export default Enrollments;