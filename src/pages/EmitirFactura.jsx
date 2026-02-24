import React, { useState, useContext, useEffect } from 'react'
import { Input, Button, Divider, Select, InputNumber } from 'antd'
import { issueInvoice, getStudentById, getIdInvoice, getDolarPrice } from '../client/client'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'

const EmitirFactura = () => {

	const {messageApi, contextHolder} = useContext(appContext)

	//student Data
	const [studentIdentification, setStudentIdentification] = useState('')
	const [studentData, setStudentData] = useState(null)

	//Payment Data
	const [selectedBillable, setSelectedBillable] = useState({value: 0, label: "Servicio a cancelar:", price: 0})
	const [currencyReceived, setCurrencyReceived] = useState({value: 0, label: "Metodo de pago"})
	const [reference, setReference] = useState('')
	const [chargedAmount, setChargedAmount] = useState(0)
	const [amountReceived, setAmountReceived] = useState(0)
	const [dolarPrice, setDolarPrice] = useState(0)
	const [currencyReturned, setCurrencyReturned] = useState({value: 0, label: "Moneda de devolucion:", price: 0})
	const [comment, setComment] = useState('')

	useEffect(() => {
		getDolar()
	}, [])

	async function getDolar(){
		const dolar = await getDolarPrice()
		console.log(dolar)
		setDolarPrice(dolar)
	}

	// Buscar estudiante por cédula (studentIdentification es numérico)
	const searchStudent = async () => {
		const idToSearch = Number(studentIdentification)
		if (!idToSearch) {
			messageApi.open({ type: 'error', content: 'Ingrese una cédula válida' })
			return
		}
		try {
			const res = await getStudentById(idToSearch)
			// Manejar distintas formas de respuesta
			if (res && res.status === 200 && res.data) {
				setStudentData(res.data[0])
			} else if (res && (res.id || res.studentIdentification || res.name)) {
				setStudentData(res)
			} else {
				messageApi.open({ type: 'error', content: 'Estudiante no está registrado' })
				setStudentData(null)
			}
		} catch (err) {
			messageApi.open({ type: 'error', content: 'Estudiante no está registrado' })
			setStudentData(null)
		}
	}

	const updatechargedAmount = (billable, payment) => {
		const servicePrice = lists.searchFullOnList(lists.BillableItems, billable).price

		if(payment == 3){
			setChargedAmount(servicePrice)
		}else{
			setChargedAmount((servicePrice * dolarPrice))
		}
	}

	const updateBillable = (e) => {
		setSelectedBillable(e)
		updatechargedAmount(e, currencyReceived)
	}

	const updatePayment = (e) => {
		setCurrencyReceived(e)
		updatechargedAmount(selectedBillable, e)
	}

	const submitIssueInvoice = async () => {
		if(selectedBillable.value==0 || currencyReceived.value==0 || studentIdentification=='' ||chargedAmount=='0 Bs.' || amountReceived=='0 Bs.'){
			messageApi.open({
				type: 'error',
				content: 'Debe ingresar todos los datos'
			})
		}else if(studentData==null){
			messageApi.open({
				type: 'error',
				content: 'Debe tener un estudiante seleccionado para emitir la factura'
			})
		}else{
			const data = {
				studentId: studentData.id,
				billableitem: selectedBillable,
				chargedAmount: chargedAmount,
				amountReceived: amountReceived,
				currencyReceived: currencyReceived,
				currencyReturned: currencyReturned,
				reference: reference,
				changeRate: dolarPrice,
				comment: comment
			}
			console.log(data)
			const res = await issueInvoice(data)
			console.log(res)

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
		setStudentIdentification('')
		setStudentData(null)
		setSelectedBillable({value: 0, label: "Servicio a cancelar:", price: 0})
		setCurrencyReceived({value: 0, label: "Metodo de pago"})
		setCurrencyReturned({value: 0, label: "Moneda de devolucion:"})
		setAmountReceived(0)
		setComment('')
		setReference('')
		setChargedAmount(0)
	}

	return(
		<div className='EmitirFactura Page'>
			<Divider className='PageTitle'><h1>Emitir factura</h1></Divider>
			{contextHolder}
			<div className='listContainer Content' >
				<div className='row'>
					<Input.Search
						placeholder='Cedula del estudiante:'
						enterButton="Buscar"
						value={studentIdentification}
						onChange={e => setStudentIdentification(e.target.value)}
						onSearch={searchStudent}
					/>
				</div>
				{studentData && (
					<div className='row'>
						<Input
							className='rowItem'
							disabled={true}
							value={studentData.name + ' ' + studentData.lastname}/>
						<Input
							className='rowItem'
							disabled={true}
							value={studentData.phone}/>
					</div>						
				)}
				<div className='row'>
					<Select 
						options={lists.BillableItems}
						className='rowItem'
						defaultValue={{value: 0, label: "Servicio a cancelar", price: 0}}
						value={selectedBillable}
						onChange={updateBillable}/>
					<Input 
						placeholder='a recibir:'
						className='rowItem'
						value={`a recibir: ${chargedAmount}`}
						disabled={true}/>
					<InputNumber 
						className='rowItem'
						value={amountReceived}
						onChange={e => setAmountReceived(e)}
						prefix="recibido:"
						/>
				</div>
				<div className='row'>
					<Select 
						options={lists.paymentMethods}
						className='rowItem'
						defaultValue={{value: 0, label: "Metodo de pago"}}
						value={currencyReceived}
						onChange={updatePayment}
					/>
					<Select 
						options={lists.paymentMethods}
						className='rowItem'
						defaultValue={{value: 0, label: "Moneda de devolucion"}}
						value={currencyReturned}
						onChange={e => setCurrencyReturned(e)}
					/>
					<Input
						placeholder='Referencia'
						className='rowItem'
						disabled={currencyReceived !== 2}
						value={reference}
						onChange={e => setReference(e.target.value)}/>
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