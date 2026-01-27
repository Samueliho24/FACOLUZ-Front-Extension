import { getAllInvoices } from '../client/client'
import { useContext, useEffect, useState } from 'react'
import { searchOnList } from '../context/lists'
import * as lists from '../context/lists'
import React from 'react'
import { Input, Button, Tooltip, List, Divider } from 'antd'
import {CheckCircleOutlined } from '@ant-design/icons'
import { getTime, getDate } from '../functions/formatDates'
import { appContext } from '../context/appContext'
import Pagination from "../components/Pagination"
import { VerifyInvoiceModal } from '../components/Modals'

const ConsultarRegistros = () => {
    const {contextHolder, messageApi} = useContext(appContext)
	const [searchParam, setSearchParam] = useState('')
	const [showList, setShowList] = useState([])
	const [selectedItem, setSelectedItem] = useState('')
	const [page, setPage] = useState(1)
	//Control de modal
	const [invoiceModal, setInvoiceModal] = useState(false)
    useEffect(() => {
        getContent()
    }, [page])

    const getContent = async() => {
        const res = await getAllInvoices(page)
		console.log(res.data)
        setShowList(res.data)
    }

	const getDailyReport = async() => {
		const res = await window.api.getDailyReport()
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

	const updateList = (newStatus) => {
		console.log("ejecuta")
		const list = showList
		const i = showList.findIndex((i) => i.id == selectedItem.id)
		console.log({Position: i, item: list[i], id: selectedItem.id})
		list[i].status = newStatus
		setShowList(list)
		// list.
		// const newList = oldList.filter(i => i.id !== selectedItem)
		// const newItem = oldList.find(i => i.id === selectedItem)
		// newItem.status = newStatus
		// newList
	}

    return(
        <div className="ConsultarRegistros Page">
            <Divider className='PageTitle'><h1>Historial de Facturacion</h1></Divider>
            <Button className='generateReport' type='primary' onClick={getDailyReport}>Generar Reporte</Button>
			{contextHolder}
			<div className='searchBar' >
				<Input
					placeholder='Ingrese cedula del paciente'
					value={searchParam}
					onChange={e => setSearchParam(e.target.value)}/>
					<Button onClick={getContent}>Consultar</Button>
			</div>
			<div className='listContainer Content' >
				<List bordered className='mainList'>
					{ showList && showList.map(item => (
						<List.Item className='listItem'>
							<div className='info'>
								<h4>{getDate(item.date)} - {getTime(item.date)} -- {item.patientId} - {item.patientName} -- {item.billableitem}  </h4>
							</div>
							<div className='buttons'>
								<Tooltip
									title='Verificar'
								>
									{item.status === "Pendiente" && <Button 
										variant='solid'
										shape='circle'
										color='primary'
										size='large'
										icon ={<CheckCircleOutlined />}
										title='Verificar'
										onClick={() => {setSelectedItem(item); setInvoiceModal(true)}}
									/>}
								</Tooltip>

								{item.status === "Recibida" && <Button 
									variant='solid'
									shape='circle'
									color='primary'
									size='large'
									icon ={<CheckCircleOutlined />}
									title='Verificar'
									onClick={() => {setSelectedItem(item); setInvoiceModal(true)}}
									disabled={true}
								/>}

								{item.status === "Rechazada" && <Button 
									variant='solid'
									shape='circle'
									color='primary'
									size='large'
									icon ={<CheckCircleOutlined />}
									title='Verificar'
									onClick={() => {setSelectedItem(item); setInvoiceModal(true)}}
									disabled={true}
								/>}
							</div>
						</List.Item>
					)) }
					<Pagination page={page} setPage={setPage}/>
				</List>
			</div>

			<div className='EmptyFooter'/>
			<VerifyInvoiceModal 
				invoice={selectedItem}
				open={invoiceModal}
				onCancel={() => setInvoiceModal(false)}
				updateList={updateList}
			/>
        </div>
    )
}

export default ConsultarRegistros