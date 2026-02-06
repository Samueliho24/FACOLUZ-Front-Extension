import { Divider, List, Button, Tooltip } from "antd";
import React, { useState, useContext, useEffect }from "react";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { getEnrolledStudentsByModule } from "../client/client";

const ModuleEnrollment = () => {
    const {view, setView} = useContext(routerContext)
    const {currentModuleEnrollment} = useContext(appContext)
    const [showList, setShowList] = useState([])

    useEffect(() => {
        getContent()
    }, [])
    async function getContent(){
        const res = await getEnrolledStudentsByModule(currentModuleEnrollment.id)
        console.log(res.data)
        setShowList(res.data)
    }

    return(
        <div className="ModuleEnrollment Page">
            <Divider className='PageTitle'><h1>Modulo de Inscripciones</h1></Divider>

            
            <div className='listContainer Content' >
                <h2>{currentModuleEnrollment.description}</h2>
                <p>Aqui podras ver la lista de estudiantes inscritos en el modulo seleccionado.</p>
                    <List bordered className='mainList' size='small'>
                        { showList.map(item => (
                            <List.Item className='listItem' key={item.id}>
                                <div className='info'>
                                    <h3>{item.studentName} {item.studentLastname} - {item.studentId} - {item.phone} - {item.state}</h3>
                                </div>
                                <div className='buttons'>
                                    <Tooltip onClick={() => {setView('ModuleEnrollment'); setCurrentModuleEnrollment(item)}} title='Lista de inscritos'><Button shape='circle' variant='solid' color='primary' size='large' icon={<UnlockOutlined />} /></Tooltip>
                                </div>
                            </List.Item>
                        )) }
                    </List>
                <Button className='Button' onClick={() => setView('Enrollments')}>Volver</Button>
            </div>


            <div className="EmptyFooter"/>
        </div>
    )
}

export default ModuleEnrollment;