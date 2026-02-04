import React, { useState, useContext } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewCourse, EditCourse } from "../components/Modals"

const Students = () => {

    const [showList, setShowList] = useState([{name: "test", id: 1111}])
    const {contextHolder} = useContext(appContext)
    const [selectedCourse, setSelectedCourse] = useState("")

    const [addModal, setAddModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    return(
        <div className="VerificarFactura Page">
            <Divider className='PageTitle'><h1>Cursos</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar curso"/>
                <Button>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <List>
                {showList.map(item => (
                    <List.Item>
                        <h3>{item.name}</h3>
                        <Button onClick={() => {setSelectedCourse(item.id); setEditModal(true)}}>Editar</Button>
                    </List.Item>
                ))}
            </List>

            <AddNewCourse 
                open={addModal}
                onCancel={() => setAddModal(false)}
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