import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider, message } from "antd"
import { AddNewCourse, EditCourse } from "../components/Modals"
import { createNewCourse, getAllCourses } from "../client/client"

const Students = () => {

    const [showList, setShowList] = useState([{name: "test", id: 1111}])
    const {contextHolder, messageApi} = useContext(appContext)
    const [selectedCourse, setSelectedCourse] = useState("")

    const [addModal, setAddModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const submitNewCourse = async(data) => {
        const res = await createNewCourse(data)
        if(res.status == 200){
            messageApi.open({
                type: "success",
                content: "Curso creado con exito"
            })
            setAddModal(false)
            getInfo()
        }else{
            messageApi.open({
                type: "error",
                content: "ah ocurrido un error"
            })
        }
    }

    async function getInfo(){
        const res = await getAllCourses()
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({
                type: "error",
                content: "ah ocurrido un error"
            })
        }
    }

    useEffect(() => {
        getInfo()
    }, [])

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Cursos</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar curso"/>
                <Button>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map(item => (
                        <List.Item className='listItem'>
                            <div className="info">
                                <h3>{item.description}</h3>
                            </div>
                            <Button onClick={() => {setSelectedCourse(item.id); setEditModal(true)}}>Editar</Button>
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewCourse 
                open={addModal}
                onCancel={() => setAddModal(false)}
                action={submitNewCourse}
            />

            <EditCourse 
                open={editModal}
                onCancel={() => setEditModal(false)}
                selectedCourse={selectedCourse}
            />
        </div>
    )
}

export default Students