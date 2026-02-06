import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewModule } from "../components/Modals"
import { createNewModule, getAllModules } from "../client/client"

const Students = () => {

    const [showList, setShowList] = useState([])
    const {contextHolder, messageApi} = useContext(appContext)

    const [addModal, setAddModal] = useState(false)

	const submitNewModule = async(data) => {
		const res = await createNewModule(data)
		if(res.status == 200){
			messageApi.open({
                type: 'success',
                content: "Modulo creado"
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
        const res = await getAllModules()
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
            <Divider className='PageTitle'><h1>Modulos</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar modulo"/>
                <Button>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map((item) => (
                        <List.Item className='listItem'>
                            <div className="info">
                                <h3>{item.description}</h3>
                            </div>
                            <Button>Suspender modulo</Button>
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewModule 
                open={addModal}
                onCancel={() => setAddModal(false)}
                action={submitNewModule}
            />
        </div>
    )
}

export default Students