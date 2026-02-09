import React, { useContext,useEffect,useState } from 'react';
import { Button, Divider, Input, List, Tooltip } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { getAllModules, getSearchedModule } from '../client/client';
import { UnlockOutlined } from '@ant-design/icons';



const Enrollments = () => {
    const [open, setOpen] = useState(false);
    const {view, setView} = useContext(routerContext)
    const {contextHolder} = useContext(appContext)
    const {setCurrentModuleEnrollment} = useContext(appContext)

    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)

    useEffect(() => {
        getContent()
    }, [])

    async function getContent(){
        const searchInput = document.getElementById("searchInput").value
        let res
        if(searchInput == ""){
            res = await getAllModules()
        }else{
            res = await getSearchedModule(searchInput)
        }
        setShowList(res.data)
    }

    return (
        <div className='Enrollments Page'>
            <Divider className="PageTitle"><h1>Inscripciones</h1></Divider>
            {contextHolder}

            <div className="searchBar">
                <Input placeholder="Buscar Modulo" id="searchInput" />
                <Button onClick={() => getContent()}>Buscar</Button>
                <Button onClick={() => setView('NewEnrollment')}>Inscribir</Button>
            </div>

            <div className='listContainer Content' >
				<List bordered className='mainList' size='small'>
					{ showList.map(item => (
						<List.Item className='listItem' key={item.id}>
							<div className='info'>
								<h3>{item.description} </h3>
							</div>
							<div className='buttons'>
								<Tooltip onClick={() => {setView('ModuleEnrollment'); setCurrentModuleEnrollment(item)}} title='Lista de inscritos'><Button shape='circle' variant='solid' color='primary' size='large' icon={<UnlockOutlined />} /></Tooltip>
							</div>
						</List.Item>
					)) }
				</List>
			</div>
            <div className="EmptyFooter"/>
            {/* Aquí podrías incluir un modal o componente para gestionar las inscripciones */}
        </div>
    )
}

export default Enrollments;
