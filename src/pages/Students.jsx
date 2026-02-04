import React, { useState, useContext } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewStudent } from "../components/Modals"

const Students = () => {

    const [showList, setShowList] = useState([])
    const {contextHolder} = useContext(appContext)

    const [addModal, setAddModal] = useState(false)

    return(
        <div className="VerificarFactura Page">
            <Divider className='PageTitle'><h1>Estudiantes</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar estudiante"/>
                <Button>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <List>
                {showList.map((item) => {
                    <List.Item>
                        {item.name}
                    </List.Item>
                })}
            </List>

            <AddNewStudent 
                open={addModal}
                onCancel={() => setAddModal(false)}
            />
        </div>
    )
}

export default Students