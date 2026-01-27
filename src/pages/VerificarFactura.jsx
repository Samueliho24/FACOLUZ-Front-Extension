import React,{ useContext, useEffect, useState } from 'react'
import { Input, Button, Tooltip, List, Divider } from 'antd'
import {CheckCircleOutlined } from '@ant-design/icons'
import { getInvoicesVerification, getinvoicesVerificationById } from '../client/client'
import { VerifyInvoiceModal as VerifyInvoice } from '../components/Modals'
import { appContext } from '../context/appContext'
import { getDate, getTime } from '../functions/formatDateTime'
import Pagination from "../components/Pagination"

const VerificarFactura = () => {
	const {contextHolder} = useContext(appContext)
	const [searchParam, setSearchParam] = useState('')
	const [showList, setShowList] = useState([])
	const [selectedItem, setSelectedItem] = useState('')
	const [page, setPage] = useState(1)
	//Control de modal
	const [verifyModal, setVerifyModal] = useState(false)
	const getContent = async() => {
		if(searchParam!=''){
			const res = await getinvoicesVerificationById(searchParam, page)
			setShowList(res.data)
			return
		}
		const res = await getInvoicesVerification(page)
		setShowList(res.data)
	}

	

	useEffect(() => {
		getContent()
	}, [page])

	return(
		<div className='VerificarFactura Page'>
			<Divider className='PageTitle'><h1>Verificar factura</h1></Divider>
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
								<Tooltip onClick={() => {setSelectedItem(item); setVerifyModal(true)}} title='Verificar'><Button  variant='solid' shape='circle' color='primary' size='large' icon ={<CheckCircleOutlined />} title='Verificar'/></Tooltip>
							</div>
						</List.Item>
					)) }
					<Pagination page={page} setPage={setPage}/>
				</List>
			</div>

			<div className='EmptyFooter'/>

			<VerifyInvoice 
				open={verifyModal}
				onCancel={()=>{setVerifyModal(false); setSelectedItem('')}}
				invoice={selectedItem} 
			/>
		</div>
	)
}

export default VerificarFactura