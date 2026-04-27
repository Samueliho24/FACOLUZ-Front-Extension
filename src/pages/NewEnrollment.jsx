import React, { useState, useContext, useEffect } from 'react';
import { Button, Divider, Input, Select, Row, Col, Space } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { AddNewStudent } from '../components/Modals';
import { moduleList, monthNames } from '../context/lists';
import { getStudentById, getLastEnrollmentByStudentId, registerEnrollment, getSectionByModule, getAllModules} from '../client/client';

const Enrollments = () => {
    const { messageApi, periodData, contextHolder, moduleList, setModuleList, setCtxModuleList, mo } = useContext(appContext);
    const { setView } = useContext(routerContext);
    
    const [addModal, setAddModal] = useState(false);
    const [student, setStudent] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionList, setSectionList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    


    const refreshSections = async (moduleId) => {
        if (!moduleId) return; // Validación de seguridad
        const res = await getSectionByModule(moduleId);
        if (res.status === 200) {
            setSectionList(res.data);
        }
    };
    const loadModuleLists = async () => {
        const modulesRes = await getAllModules();
        if (modulesRes.status === 200) {
            setModuleList(modulesRes.data);
            if (setCtxModuleList) setCtxModuleList(modulesRes.data);
        }
    }
    
    useEffect(() => {
        loadModuleLists()
    }, [])

    const Enrollment = async () => {
        if (!student || !selectedModule) return;

        const data = {
            studentId: student.id,
            sectionId: selectedSection,
        };

        const res = await registerEnrollment(data);
        if (res.status === 200) {
            messageApi.success("Inscripción realizada con éxito");
            setView('Enrollments');
        } else {
            messageApi.error(res.response?.data || "Error al inscribir");
        }
    };

    async function searchStudent() {
    if (!searchValue) return;
    
    setStudent(null); 
    setSelectedModule(null);

    try {
        const res = await getLastEnrollmentByStudentId(searchValue);
        
        if (res.status === 200 && res.data && res.data.length > 0) {
            setStudent(res.data[0]);
        } else {
            const res2 = await getStudentById(searchValue);
            
            if (res2.status === 200) {
                const dataFinal = Array.isArray(res2.data) ? res2.data[0] : res2.data;
                
                setStudent(dataFinal);
            } else {
                messageApi.error('No se han encontrado estudiantes con esta cédula');
            }
        }
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        messageApi.error('Hubo un error al conectar con el servidor');
    }
}

    // Componente auxiliar para las etiquetas (Labels) imitando a Ant Design
    const Field = ({ label, value }) => (
        <div style={{ marginBottom: '16px', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{label}:</label>
            <Input value={value || ''} disabled style={{ color: 'rgba(0, 0, 0, 0.85)' }} />
        </div>
    );

    return (
        <div className='NewEnrollment Page'>
            <Divider className="PageTitle"><h1>Inscripción</h1></Divider>
            {contextHolder}

            <div className="searchBar" style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <Input 
                    placeholder="Buscar estudiante" 
                    value={searchValue} 
                    onChange={(e) => setSearchValue(e.target.value)}
                    onPressEnter={searchStudent}
                />
                <Button type="primary" onClick={searchStudent}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className="listContainer Content Enrollments" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                {student === null ? (
                    <h3 style={{ textAlign: 'center' }}>Ingrese la cédula del estudiante a inscribir</h3>
                ) : (
                    <div className="student-info-grid">
                        <Row gutter={[24, 0]}>
                            <Col span={8}><Field label="Nombre" value={student.name} /></Col>
                            <Col span={8}><Field label="Apellido" value={student.lastname} /></Col>
                            <Col span={8}><Field label="Cédula" value={student.studentsIdentification} /></Col>
                            
                            <Col span={8}><Field label="Email" value={student.email} /></Col>
                            <Col span={8}><Field label="Teléfono" value={student.phone} /></Col>
                            <Col span={8}><Field label="Estado" value={student.studentStatus} /></Col>
                        </Row>

                        {student.enrollmentStatus && (
                            <Row gutter={[24, 0]}>
                                <Col span={8}><Field label="Módulo" value={student.description} /></Col>
                                <Col span={8}><Field label="Sección" value={student.code} /></Col>
                                <Col span={8}><Field label="Periodo" value={`${monthNames[student.period - 1]} - ${student.year}`} /></Col>
                                
                                <Col span={8}><Field label="Modalidad" value={student.modality} /></Col>
                                <Col span={16}><Field label="Estatus de Inscripción" value={student.enrollmentStatus} /></Col>
                            </Row>
                        )}
                    </div>
                )}

                <Divider />

                <div className='action-area' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', width: '70%' }}>
                    <Select
                        disabled={student === null}
                        placeholder="Seleccione un Módulo"
                        value={selectedModule}
                        options={moduleList.map(module => ({
                            value: module.id,
                            label: module.description
                        }))}
                        style={{ width: "100%", maxWidth: '600px' }}
                        onChange={val => { 
                            setSelectedModule(val); 
                            setSelectedSection(null); // Reseteamos la sección anterior
                            refreshSections(val);     // Pasamos el valor actual directamente
                        }}
                    />

                    <Select
                        disabled={student === null || !selectedModule}
                        placeholder=" Sección"
                        value={selectedSection}
                        options={sectionList.map(section => ({
                            value: section.id,
                            label: `Periodo ${monthNames[section.period - 1]} - Sección ${section.code}`
                        }))}
                        style={{ width: "100%", maxWidth: '600px' }}
                        onChange={val => {setSelectedSection(val); }}
                    />

                    <Space>
                        <Button
                            type="primary"
                            onClick={Enrollment}
                            disabled={!selectedModule || !student}
                        >
                            Inscribir
                        </Button>
                        <Button onClick={() => { setStudent(null); setSelectedModule(null); setSearchValue(""); }}>
                            Cancelar
                        </Button>
                    </Space>
                </div>
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