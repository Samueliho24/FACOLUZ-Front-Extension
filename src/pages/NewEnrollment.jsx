import React, { useState, useContext } from 'react';
import { Button, Divider, Input, DatePicker, Select, message } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { AddNewStudent } from '../components/Modals';
import { moduleList } from '../context/lists';
import { getStudentById, registerEnrollment} from '../client/client';


const Enrollments = () => {
    const {messageApi, periodData, contextHolder} = useContext(appContext)
    const [addModal, setAddModal] = useState(false)
    const [student, setStudent] = useState(null)
    const {view, setView} = useContext(routerContext)
    const [selectedModule, setSelectedModule] = useState(null)


    const Enrollment = async() => {
        const data = {
            studentId: student.id,
            periodData: periodData.id,
            moduleId: document.getElementById("moduleSelect").value
        }
        console.log(data)        
        const res = await registerEnrollment(data)
        console.log(res)
        if(res.status == 200){
            messageApi.open({
                type: 'success',
                content: res.data
            })
            setView('Enrollments')
        }else{
            messageApi.open({
                type: 'error',
                content: res.response.data
            })
        }
    }

    async function searchStudent(){
        const searchInput = document.getElementById("searchInput").value
        const res = await getStudentById(searchInput)
        console.log(res)
        if(res.status == 200) {
            setStudent(res.data[0])
        }else{
            messageApi.open({
				type: 'error',
				content: res.response.data
			})
        }
    }

    return (
        <div className='NewEnrollment Page'>
            <Divider className="PageTitle"><h1>Inscripcion</h1></Divider>
            {contextHolder}

            <div className="searchBar">
                <Input id="searchInput" placeholder="Buscar estudiante"/>
                <Button onClick={searchStudent}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className="Content" style={{display: "flex", alignItems: 'center', flexDirection: 'column'}}>
                {student === null ? (
                    <h3>Ingrese la cedula del estudiante a inscribir</h3>
                ):(<>
                    <h3>Nombre y apellido del estudiante: {`${student?.name} ${student?.lastname}`}</h3>
                    <h3>Cedula: {student?.studentsId}</h3>
                    <h3>Telefono: {student?.phone}</h3>
                    <h3>Correo: {student?.email}</h3>
                    <h3>Periodo academico: 2026-2</h3>
                </>)}
                <div className='buttons' style={{display: 'flex', alignItems: 'center', gap: "8px", width: '100%', justifyContent: 'center'}}>
                    <Select
                        defaultValue={"Seleccione un Modulo"}
                        value={selectedModule}
                        options={moduleList}
                        style={{width:"50%"}}
                        onChange={e => setSelectedModule(e)}
                        placeholder={"Seleccione un modulo"}/>
                    <Button
                        color="purple"
                        variant="solid"
                        onClick={() => Enrollment()}
                        disabled={selectedModule === null || student === null}
                    >Inscribir</Button>
                    <Button color="purple" variant="solid" onClick={() => setView('Enrollments')}>Cancelar</Button>
                </div>
            </div>
            <div className="EmptyFooter"/>  
            <AddNewStudent
                open={addModal}
                onCancel={() => setAddModal(false)}/>
        </div>
    )
}

export default Enrollments;
