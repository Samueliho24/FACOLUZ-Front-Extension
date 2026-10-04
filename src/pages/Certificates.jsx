import React, { useContext,useEffect,useState } from 'react';
import { Button, Divider, Input, List, Tooltip } from "antd";
import { appContext } from "../context/appContext";
import { routerContext } from "../context/routerContext";
import { getCertificateList, filterStudents, saveCertificate } from '../client/client';
import { PrinterOutlined } from '@ant-design/icons';
import { getDate } from '../functions/formatDateTime';
import FacoNumber from '../components/FacoNumber';

const Enrollments = () => {
    const [open, setOpen] = useState(false);
    const {view, setView} = useContext(routerContext)
    const {contextHolder, messageApi} = useContext(appContext)

    const [showList, setShowList] = useState([])
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState()

    useEffect(() => {
        getContent()
    }, [])

    async function getContent(){
        let res
        if(searchInput == ""){
            res = await getCertificateList()
            console.log(res)
        }else{
            res = await filterStudents(searchInput)
        }
        setShowList(res.data)
    }

    const callSaveCertificate = async(certificate) => {
		const res = await saveCertificate(certificate.certificate_id)
		if(res.status === 200){
            const fileName = `Certificado de ${certificate.course_name} a ${certificate.name} ${certificate.lastname}.pdf`
            window.api.saveFile(res.data, fileName)
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
                <FacoNumber placeholder="Ingrese cedula del estudiante" value={searchInput} onChange={e => setSearchInput(e)} />
                <Button onClick={() => getContent()}>Buscar</Button>
                <Button>Emitir certificado</Button>
            </div>

            <div className='listContainer Content' >
				<List bordered className='mainList' size='small'>
					{ showList.map(item => (
						<List.Item className='listItem' key={item.id}>
							<div className='info'>
								<h3>{item.name} {item.lastname} -- {item.course_name} -- Fecha: {getDate(new Date(item.date))}</h3>
							</div>
							<div className='buttons'>
								<Tooltip onClick={() => {callSaveCertificate(item)}} title='Imprimir certificado'><Button shape='circle' variant='solid' color='primary' size='large' icon={<PrinterOutlined />} /></Tooltip>
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
