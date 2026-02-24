import React, { useContext,useEffect,useState } from 'react';
import { Button, Divider, Input, List, Tooltip } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { getCertificateList } from '../client/client';
import { PrinterOutlined } from '@ant-design/icons';
import { mergeDate } from '../functions/formatDateTime';

const Enrollments = () => {
    const [open, setOpen] = useState(false);
    const {view, setView} = useContext(routerContext)
    const {contextHolder, messageApi} = useContext(appContext)

    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)

    useEffect(() => {
        getContent()
    }, [])

    async function getContent(){
        const searchInput = document.getElementById("searchInput").value
        let res
        if(searchInput == ""){
            res = await getCertificateList()
            console.log(res)
        }else{
            // res = await getSearchedModule(searchInput)
        }
        setShowList(res.data)
    }

    const saveCertificate = async(certificate_id) => {
		const res = await window.api.saveCertificate(certificate_id)
		if(res.ok == true){
			messageApi.open({
				type: 'success',
				content: 'Reporte guardado en descargas'
			})
		}else{
			messageApi.open({
				type: 'error',
				content: 'ah ocurrido un error al guardar el reporte'
			})
		}
	}

    return (
        <div className='Enrollments Page'>
            <Divider className="PageTitle"><h1>Certificados</h1></Divider>
            {contextHolder}

            <div className="searchBar">
                <Input placeholder="Ingrese cedula del estudiante" id="searchInput" />
                <Button onClick={() => getContent()}>Buscar</Button>
                <Button>Emitir certificado</Button>
            </div>

            <div className='listContainer Content' >
				<List bordered className='mainList' size='small'>
					{ showList.map(item => (
						<List.Item className='listItem' key={item.id}>
							<div className='info'>
								<h3>{item.name} {item.lastname} -- {item.course_name} -- Fecha: {mergeDate(Date(item.mergeDate))}</h3>
							</div>
							<div className='buttons'>
								<Tooltip onClick={() => {saveCertificate(item.certificate_id)}} title='Imprimir certificado'><Button shape='circle' variant='solid' color='primary' size='large' icon={<PrinterOutlined />} /></Tooltip>
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
