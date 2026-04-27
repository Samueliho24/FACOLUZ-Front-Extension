import React, { useContext, useState, useEffect } from "react";
import { Button, Divider, Input, List, Tooltip } from "antd";
import { getPeriods, getAllModules } from "../client/client";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { LoadGradesModal, ModifyGradesModal, ViewGradesSectionModal} from '../components/Modals'
import { monthNames } from "../context/lists";

const Grades = () => {
	const [period, setPeriod] = useState(null)
    
    const {contextHolder, messageApi, setModuleList} = useContext(appContext)
    const [loadModalOpen, setLoadModalOpen] = useState(false)
    const [modifyModalOpen, setModifyModalOpen] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [showList, setShowList] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState({})

    const [closeModalOpen, setCloseModalOpen] = useState(false)
    const [periodToClose, setPeriodToClose] = useState(null)
    const [periodToEdit, setPeriodToEdit] = useState(null)
    const {view, setView} = useContext(routerContext)


    
    // Función para refrescar la lista de periodos
    const refreshPeriods = async () => {
        const res = await getPeriods()
        if(res.status == 200){
            setShowList(res.data)
        }
    }

    const getModules = async () => {
        const res = await getAllModules()
        if (res.status === 200) {
            setModuleList(res.data)
        }
    }

    useEffect(() => {
        getModules()
        refreshPeriods()
    }, [])

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Notas</h1></Divider>
			{contextHolder}
            <div className="searchBar">
                <Input
                    placeholder="Buscar periodo"/>
                <Button>Buscar</Button>
                <Button onClick={() => setLoadModalOpen(true)}>Cargar Notas</Button>
                <Button onClick={() => setModifyModalOpen(true)}>Modificar Nota</Button>
            </div>

            <div className='listContainer Content' >
                <List bordered className='mainList'>
                        {showList.map(item => {
                            const month = monthNames[item.period - 1] || item.period;
                            return (
                                <List.Item className='listItem' key={item.id}>
                                    <div className="info">
                                        <h3>{month} - {item.year} - {item.modality} - {item.status}</h3>
                                    </div>
                                    <div className="buttons">
                                        <Tooltip title='Ver secciones'><Button variant='solid' color='primary' size='large' onClick={() => { setSelectedPeriod(item); setViewModal(true); }} >Secciones</Button></Tooltip>
                                    </div>
                                </List.Item>
                            );
                        })}
                </List>
            </div>
            <LoadGradesModal
                open = {loadModalOpen}
                onCancel = {() => setLoadModalOpen(false)}
            />
            <ModifyGradesModal
                open = {modifyModalOpen}
                onCancel = {() => setModifyModalOpen(false)}
            />
            <ViewGradesSectionModal
                open = {viewModal}
                onCancel = {() => setViewModal(false)}
                period = {selectedPeriod}
            />
        </div>
    )
}

export default Grades;
