import React, { useState, useContext, useEffect } from 'react'
import { Input, Button, Divider, Select, InputNumber } from 'antd'
import { issueInvoice, getStudentById, getIdInvoice, getDolarPrice } from '../client/client'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'

const EmitirFactura = () => {

	const {messageApi, contextHolder} = useContext(appContext)

	//Collected Data
	const [studentIdentification, setStudentIdentification] = useState(0)
	const [selectedBillable, setSelectedBillable] = useState({value: 0, label: "Servicio a cancelar:", price: 0})
	const [quantity, setQuantity] = useState(1)
	const [chargedAmount, setChargedAmount] = useState(0)
	const [comment, setComment] = useState("")

	const submitIssueInvoice = async () => {
		if(studentIdentification === 0 || chargedAmount==0){
			messageApi.open({
				type: 'error',
				content: 'Debe ingresar todos los datos'
			})
		}else{
			const data = {
				studentIdentification: studentIdentification,
				billableitem: selectedBillable,
				quantity: quantity,
				chargedAmount: chargedAmount,
				comment: comment
			}
			const res = await issueInvoice(data)

			if(res.status == 200){
				messageApi.open({
					type: 'success',
					content: 'Factura creada con exito'
				})
				resetForm()
				onCancel()
			}else{
				messageApi.open({
					type: 'error',
					content: res.response.data
				})
			}
		}
	}
	
	function resetForm(){
		setStudentIdentification(0)
		setSelectedBillable({value: 0, label: "Servicio a cancelar:", price: 0})
		setQuantity(1)
		setChargedAmount(0)
		setComment("")
	}

	return(
		<div className='EmitirFactura Page'>
			<Divider className='PageTitle'><h1>Emitir factura</h1></Divider>
			{contextHolder}
			<div className='listContainer Content' >
				<div className='row'>
					<InputNumber
						placeholder='Cedula del estudiante:'
						value={studentIdentification}
						onChange={e => setStudentIdentification(e)}
					/>
				</div>

				<div className='row'>
					<Select 
						options={lists.BillableItems}
						className='rowItem'
						defaultValue={{value: 0, label: "Servicio a cancelar", price: 0}}
						value={selectedBillable}
						onChange={e => setSelectedBillable(e)}/>
					<InputNumber 
						placeholder='Cantidad:'
						className='rowItem'
						value={quantity}
						onChange={e => setQuantity(e)}
						prefix="Cantidad: "/>
				</div>

				<div className='row'>
					<InputNumber 
						className='rowItem'
						value={chargedAmount}
						prefix="A facturar: "
						onChange={e => setChargedAmount(e)}
					/>
				</div>
				<div className='row'>
					<Input 
						placeholder='Observaciones' 
						value={comment} 
						onChange={e => setComment(e.target.value)}/>
				</div>
				
				<Button onClick={submitIssueInvoice}>Emitir factura</Button>
			</div>

            <div className='EmptyFooter'/>
		</div>
	)
}

export default EmitirFactura