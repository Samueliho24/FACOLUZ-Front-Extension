import React, { useContext, useState, useEffect } from "react";
import { Button, Divider, Input, List, Tooltip } from "antd";
import { getSections, getSectionByModule } from "../client/client";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { monthNames } from "../context/lists";
import { getDate } from "../functions/formatDateTime";

const SectionEnrollment = () => {
    const {contextHolder, messageApi, currentModuleEnrollment} = useContext(appContext)
    const [modalOpen, setModalOpen] = useState(false)
    const [showList, setShowList] = useState([])
    const [closeModalOpen, setCloseModalOpen] = useState(false)
    const [sectionToClose, setSectionToClose] = useState(null)
    const {view, setView} = useContext(routerContext)
    
    // Función para refrescar la lista de secciones
    const refreshSections = async () => {
        const res = await getSectionByModule(currentModuleEnrollment.id)
        if(res.status == 200){
            setShowList(res.data)
        }
    }

    useEffect(() => {
        refreshSections()
    }, [])

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Secciones</h1></Divider>
            {contextHolder}
            <h3><strong>Modulo:</strong> {currentModuleEnrollment.description}</h3>
            
            <div className="searchBar">
                <Input placeholder="Buscar sección"/>
                <Button>Buscar</Button>
                
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                        {showList.map(item => {
                            const month = monthNames[item.period - 1] || item.period;
                            return (
                                <List.Item className='listItem' key={item.id}>
                                    <div className="info">
                                        <h3>Periodo {month}-{item.year} - Seccion {item.code} - 0/{item.quota}</h3>
                                    </div>
                                    <div></div>
                                    <div className="buttons">

                                        <Tooltip title='Ver alumnos'><Button variant='solid' color='primary' size='large' onClick={() => { setCurrentSection(item); setView('SectionDetail'); }} >Alumnos</Button></Tooltip>
                                    </div>
                                </List.Item>
                            );
                        })}
                </List>
            </div>
            
        </div>
    )
}

export default SectionEnrollment;