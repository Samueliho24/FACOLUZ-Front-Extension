import React, { useState, useContext, useEffect } from "react"
import { appContext } from "../context/appContext" 
import { Input, Button, List, Divider } from "antd"
import { AddNewModule, DesactivateModuleModal } from "../components/Modals"
import { createNewModule, getAllModules, deactivateModule, getSearchedModule } from "../client/client"

const Modules = () => {

    const [showList, setShowList] = useState([])
    const {contextHolder, messageApi} = useContext(appContext)

    const [addModal, setAddModal] = useState(false)
    const [desactivateModalOpen, setDesactivateModalOpen] = useState(false)
    const [selectedModule, setSelectedModule] = useState(null)
    const [searchText, setSearchText] = useState("")

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

    async function searchModules(){
        const q = (searchText || '').trim()
        if(q === ''){
            getInfo()
            return
        }
        const res = await getSearchedModule(q)
        if(res.status == 200){
            setShowList(res.data)
        }else{
            messageApi.open({ type: 'error', content: 'Error al buscar' })
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
                    placeholder="Buscar modulo"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)} />
                <Button onClick={searchModules}>Buscar</Button>
                <Button onClick={() => setAddModal(true)}>Agregar</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                    {showList.map((item) => (
                        <List.Item className='listItem'>
                            <div className="info">
                                <h3>{item.description}</h3>
                            </div>
                            <Button onClick={() => { setSelectedModule(item); setDesactivateModalOpen(true) }}>Suspender modulo</Button>
                        </List.Item>
                    ))}
                </List>
            </div>

            <AddNewModule 
                open={addModal}
                onCancel={() => setAddModal(false)}
                action={submitNewModule}
            />

            <DesactivateModuleModal
                open={desactivateModalOpen}
                onCancel={() => { setDesactivateModalOpen(false); setSelectedModule(null) }}
                module={selectedModule}
                action={async (id) => {
                    const res = await deactivateModule({ moduleId: id })
                    if(res.status == 200){
                        setDesactivateModalOpen(false)
                        setSelectedModule(null)
                        getInfo()
                    }
                    return res
                }}
            />

            
        </div>
    )
}

export default Modules