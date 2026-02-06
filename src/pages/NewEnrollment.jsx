import React, { useState, useContext } from 'react';
import { Button, Divider, Input, DatePicker, Select, message } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { AddNewStudent } from '../components/Modals';
import { moduleList } from '../context/lists';
import { getStudentById, registerEnrollment} from '../client/client';


const Enrollments = () => {
    const [addModal, setAddModal] = useState(false)
    const [student, setStudent] = useState(null)
    const {view, setView} = useContext(routerContext)
    const {messageApi, periodData, contextHolder} = useContext(appContext)

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
            setStudent(res.data)
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

            <div className="Content">
                <h3>Nombre y apellido del estudiante: {student?.name || ""}</h3>
                <h3>Cedula: {student?.cedula || ""}</h3>
                <h3>Telefono: {student?.phone || ""}</h3>
                <h3>Correo: {student?.email || ""}</h3>
                <h3>Periodo academico: 2026-2</h3>
                <Select placeholder="Modulo" options={moduleList}/>
                <Button color="purple" variant="solid" onClick={() => Enrollment()}>Inscribir</Button>
                <Button color="purple" variant="solid" onClick={() => setView('Enrollments')}>Cancelar</Button>
            </div>
            <div className="EmptyFooter"/>
            <AddNewStudent open={addModal} onCancel={() => setAddModal(false)} />
        </div>
    )
}

export default Enrollments;
