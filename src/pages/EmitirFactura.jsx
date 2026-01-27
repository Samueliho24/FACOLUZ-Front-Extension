import React, { useState, useContext, useEffect } from 'react'
import { Input, Button, Divider, Select } from 'antd'
import { issueInvoice, getSearchedPatient, getIdInvoice, getDolarPrice } from '../client/client'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'

const EmitirFactura = () => {

	const {messageApi, contextHolder} = useContext(appContext)

	//Patient Data
	const [patientId, setPatientId] = useState('')
	const [patientName, setPatientName] = useState('')
	const [patientPhone, setPatientPhone] = useState('')

	//Payment Data
	const [selectedBillable, setSelectedBillable] = useState({value: 0, label: "Servicio a cancelar:", price: 0})
	const [paymentMethod, setPaymentMethod] = useState({value: 0, label: "Metodo de pago"})
	const [reference, setReference] = useState('')
	const [amount, setAmount] = useState(0)
	const [dolarPrice, setDolarPrice] = useState(0)

	useEffect(() => {
		getDolar()
	}, [])

	async function getDolar(){
		const dolar = await getDolarPrice()
		console.log(dolar)
		setDolarPrice(dolar)
	}

	const updateAmount = (billable, payment) => {
		const servicePrice = lists.searchFullOnList(lists.BillableItems, billable).price

		if(payment == 3){
			setAmount(servicePrice)
		}else{
			setAmount((servicePrice * dolarPrice))
		}
	}

	const updateBillable = (e) => {
		setSelectedBillable(e)
		updateAmount(e, paymentMethod)
	}

	const updatePayment = (e) => {
		setPaymentMethod(e)
		updateAmount(selectedBillable, e)
	}

	const submitIssueInvoice = async () => {
		if(selectedBillable.value==0 || paymentMethod.value==0 || patientId=='' || patientName=='' || amount=='0 Bs.' || patientPhone==''){
			messageApi.open({
				type: 'error',
				content: 'Debe ingresar todos los datos'
			})
		}else{
			const data = {
				patientId: patientId,
				patientName: patientName,
				patientPhone: patientPhone,
				billableItem: selectedBillable,
				amount: amount,
				currency: paymentMethod,
				reference: reference,
				changeRate: dolarPrice
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
		setPatientId('')
		setPatientName('')
		setPatientPhone('')
		setSelectedBillable({value: 0, label: "Servicio a cancelar:", price: 0})
		setPaymentMethod({value: 0, label: "Metodo de pago"})
		setReference('')
		setAmount(0)
	}

	return(
		<div className='EmitirFactura Page'>
			<Divider className='PageTitle'><h1>Emitir factura</h1></Divider>
			{contextHolder}
			<div className='listContainer Content' >
				<div className='row'>
					<Input
						placeholder='cedula:'
						value={patientId}
						onChange={e => setPatientId(e.target.value)}
						className='rowItem'/>
					<Input
						placeholder='Nombre:'
						className='rowItem'
						value={patientName}
						onChange={e => setPatientName(e.target.value)}
					/>
					<Input
						placeholder='Telefono:'
						className='rowItem'
						value={patientPhone}
						onChange={e => setPatientPhone(e.target.value)}
					/>
				</div>
				<div className='row'>
					<Select 
						options={lists.BillableItems}
						className='rowItem'
						defaultValue={{value: 0, label: "Servicio a cancelar", price: 0}}
						value={selectedBillable}
						onChange={updateBillable}/>
					<Input 
						placeholder='Monto:'
						className='rowItem'
						value={`Monto: ${amount}`}
						disabled={true}/>
				</div>
				<div className='row'>
					<Select 
						options={lists.paymentMethods}
						className='rowItem'
						defaultValue={{value: 0, label: "Metodo de pago"}}
						value={paymentMethod}
						onChange={updatePayment}
					/>
					<Input
						placeholder='Referencia'
						className='rowItem'
						disabled={paymentMethod !== 2}
						value={reference}
						onChange={e => setReference(e.target.value)}/>
				</div>
				
				<Button onClick={submitIssueInvoice}>Emitir factura</Button>
			</div>

            <div className='EmptyFooter'/>
		</div>
	)
}

export default EmitirFactura