import React, { useContext, useState, useEffect } from "react";
import { Button, Divider, Input, List, Tooltip } from "antd";
import { getSections, closeSection } from "../client/client";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { OpenSectionModal, CloseSectionModal } from '../components/Modals'
import { monthNames } from "../context/lists";
import { getDate } from "../functions/formatDateTime";

const Sections = () => {
    const [section, setSection] = useState(null)
    
    const {contextHolder, messageApi, currentPeriodSection} = useContext(appContext)
    const [modalOpen, setModalOpen] = useState(false)
    const [showList, setShowList] = useState([])
    const [closeModalOpen, setCloseModalOpen] = useState(false)
    const [sectionToClose, setSectionToClose] = useState(null)
    const {view, setView} = useContext(routerContext)
    
    // Función para refrescar la lista de secciones
    const refreshSections = async () => {
        const res = await getSections()
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
            <h3><strong>Periodo:</strong> {monthNames[currentPeriodSection.period - 1]} - {currentPeriodSection.year}</h3>
            <div>
                <strong>Fecha de inicio:</strong> {getDate(currentPeriodSection.startDate, false)} - {" "}   
                <strong>Fecha de fin:</strong> {getDate(currentPeriodSection.endDate, false)}
            </div>
            {contextHolder}
            
            <div className="searchBar">
                <Input placeholder="Buscar sección"/>
                <Button>Buscar</Button>
                {!(currentPeriodSection && currentPeriodSection.state === 'Finalizado') && (
                    <Button onClick={() => setModalOpen(true)}>Agregar</Button>
                )}
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                        {showList.map(item => {
                            const month = monthNames[item.periodId - 1] || item.periodId;
                            return (
                                <List.Item className='listItem' key={item.id}>
                                    <div className="info">
                                        <h3>{item.name} - {month} - {item.state}</h3>
                                    </div>
                                    <div className="buttons">
                                        <Tooltip title='Ver alumnos'><Button variant='solid' color='primary' size='large' onClick={() => { setCurrentSection(item); setView('SectionDetail'); }} >Alumnos</Button></Tooltip>
                                        {!(currentPeriodSection && currentPeriodSection.state === 'Finalizado') && item.state !== 'Finalizado' && (
                                            <Tooltip title='Cerrar sección'>
                                                <Button variant='solid' color='primary' size='large' onClick={() => { setSectionToClose(item); setCloseModalOpen(true); }}>Cerrar</Button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </List.Item>
                            );
                        })}
                </List>
            </div>

            <OpenSectionModal 
                open={modalOpen} 
                onCancel={() => setModalOpen(false)}
                refreshSections={refreshSections}
            />

            <CloseSectionModal
                open={closeModalOpen}
                onCancel={() => { setCloseModalOpen(false); setSectionToClose(null); }}
                section={sectionToClose}
                refreshSections={refreshSections}
            />

            
        </div>
    )
}

export default Sections;
