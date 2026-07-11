import React, { useState, useContext, useEffect } from 'react'
import { Input, Button, Divider, Select, InputNumber } from 'antd'
import { issueInvoice, getStudentById, getIdInvoice, getDolarPrice } from '../client/client'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import TextArea from 'antd/es/input/TextArea'

const EmitirFactura = () => {

	const {messageApi, dolarPrice, contextHolder, prices} = useContext(appContext)

	//Collected Data
	const [studentIdentification, setStudentIdentification] = useState(0)
	const [selectedBillable, setSelectedBillable] = useState("Servicio a cancelar:")
	const [quantity, setQuantity] = useState(1)
	const [chargedAmount, setChargedAmount] = useState(0)
	const [comment, setComment] = useState("")
	
	useEffect(() => {
		calculateTotal();
	}, [selectedBillable, quantity])

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
		setSelectedBillable("Servicio a cancelar:")
		// setSelectedBillable({value: 0, label: "Servicio a cancelar:", price: 0})  Si crashea descomentar esta y comentar la de arriba
		setQuantity(1)
		setChargedAmount(0)
		setComment("")
	}

	function calculateTotal(){
		var bsPrice = 0
		if(selectedBillable !== "Servicio a cancelar:" && quantity >= 1){
			var unitPrice = prices.find(x => x.name === selectedBillable).price;
			var packPrice = unitPrice * quantity;
			bsPrice = packPrice * dolarPrice;
		}
		setChargedAmount(bsPrice.toFixed(2))
	}

	return(
		<div className='EmitirFactura Page'>
			<Divider className='PageTitle'><h1>Emitir factura</h1></Divider>
			{contextHolder}
			<div className='listContainer Content' >
				<div className='row'>
					<InputNumber
						style={{width: '100%'}}
						value={studentIdentification}
						prefix="Cedula del estudiante: "
						onChange={e => setStudentIdentification(e)}
					/>
				</div>

				<div className='row'>
					<Select 
						options={prices.map(x => ({label: x.name, value: x.name}))}
						className='rowItem'
						defaultValue={"Servicio a cancelar"}
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
						style={{width: '100%'}}
						className='rowItem'
						value={chargedAmount}
						prefix="Monto a facturar: Bs. "
						onChange={e => setChargedAmount(e)}
					/>
				</div>
				<div className='row'>
					<TextArea
						autoSize
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