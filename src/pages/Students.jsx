import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewStudent } from "../components/Modals"
import { getStudents } from "../client/client"

const Students = () => {

    const {contextHolder, messageApi} = useContext(appContext)
    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)

    const [addModal, setAddModal] = useState(false)

    async function getInfo(){
        const res = await getStudents(page)
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({
                type: "success",
                content: "ah ocurrido un error"
            })
        }
    }

    useEffect(() => {
        getInfo()
    }, [page])

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Estudiantes</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar estudiante"/>
                <Button>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map((item) => (
                        <List.Item className='listItem'>
                            <div className="info">
                                <h4>{item.studentsId} - {item.name} {item.lastname}</h4>
                            </div>
                            <Button color="danger">Desactivar</Button>
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewStudent 
                open={addModal}
                onCancel={() => setAddModal(false)}
                updateList={() => getInfo()}
            />
        </div>
    )
}

export default Students