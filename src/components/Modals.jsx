import { Modal, Button, Input, InputNumber, Select, Form, Space, message } from 'antd'
import { useState, useEffect, useContext } from 'react'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import { encrypt } from '../functions/hash'
import { verifyInvoice, deleteUser, createUser, changePassword, changeUserType ,getIdUsers} from '../client/client'
import React from 'react'
import { routerContext } from '../context/routerContext'
import { getDate, getTime } from '../functions/formatDateTime'

export const LogoutModal = ({open, onCancel}) => {

	const {setUserData, setLogged} = useContext(appContext)
	const {setView} = useContext(routerContext)

	const logout = () => {
		setUserData('')
		setLogged(false)
		setView('Login')
	}

	return(
		<Modal
			title='Cerrar sesion?'
			open={open}
			closable={false}
			footer={[
				<Button variant='solid' color='danger' onClick={logout} >Cerrar sesion</Button>,
				<Button onClick={onCancel} variant='text' >Cancelar</Button>
			]}
		>
		</Modal>
	)
}

export const VerifyInvoiceModal = ({open, onCancel, invoice, updateList}) => {
	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleVerify = async (data) => {
		setLoading(true)
		let res = await verifyInvoice({idParam: invoice.id, status: data})
		if(res.status == 200){
			messageApi.open({
				type: 'success',
				content: 'Estado de la factura actualizado'
			})
			setLoading(false)
			updateList(data)
			onCancel()
		}else{
			messageApi.open({
				type: 'error',
				content: 'ah ocurrido un error'
			})
			setLoading(false)
		}
	}
	return(
		<Modal
			title='Verificar factura'
			open={open}
			closable={false}
			footer={[
				<Button disabled={loading} variant='solid' color='primary'  onClick={() => handleVerify('Recibida')} >Recibido</Button>,
				<Button disabled={loading} variant='solid' color='primary' onClick={() => handleVerify('Rechazada')} >Rechazada</Button>,
				<Button onClick={onCancel} variant='text' >Cancelar</Button>
			]}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
				<p><strong>Paciente:</strong> {invoice.patientName} - {invoice.patientId}</p>
				<p><strong>Servicio facturado:</strong> {invoice.billableitem}</p>
				<p><strong>Monto:</strong> {invoice.amount} </p>
				<p><strong>Moneda:</strong> {invoice.currency} </p>
				<p><strong>Fecha de emision:</strong> {getDate(invoice.date)} - {getTime(invoice.date)} </p>
				{invoice.reference && <p><strong>Referencia de pago:</strong> {invoice.reference} </p>}
				<p><strong>Estado:</strong> {invoice.status} </p>
			</div>
		</Modal>)
	}

export const GenerateReportModal = ({open, onCancel}) => {
	

	return(
		<Modal
			title='Generar reporte?'
			open={open}
			closable={false}
			footer={[
				<Button variant='solid' color='danger' >Reporte del dia </Button>,
				<Button onClick={onCancel} variant='text' >Cancelar</Button>
			]}
		>
		</Modal>
	)
}

export const AddNewUserModal = ({open, onCancel, updateList}) => {

	//Control de la UI
	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	//Control de los campos
	const [idType, setIdType] = useState('')
	const [idNumber, setIdNumber] = useState('')
	const [name, setName] = useState('')
	const [lastname, setLastname] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword,setConfirmPassword] =useState('')
	const [userType, setUserType] = useState('')


	async function findUser(id){
		let res = await getIdUsers(id)

		console.log(res)
		
		switch (res.data[0].active) {
			case 0:
				messageApi.open({
					type: 'error',
					content: 'El usuario con esa cedula existe pero esta inactivo'
				})
				setLoading(true)
				break;
			case 1:
				messageApi.open({
					type: 'error',
					content: 'El usuario con esa cedula existe.'
				})
				setLoading(true)
				break;
			case undefined:
				setLoading(false)
				break;
		}
	}
	const cleanForm = () => {
		setIdType('')
		setIdNumber('')
		setName('')
		setLastname('')
		setPassword('')
		setConfirmPassword('')
		setUserType('')
		onCancel()
	}

	const submitNewUser = async () => {
		if(idType=='' || idNumber=='' || name=='' || lastname=='' || password == '' || confirmPassword==''){
			messageApi.open({
				type: 'error',
				content: 'Debe ingresar todos los datos'
			})
		}else if(password!=confirmPassword){
			messageApi.open({
				type: 'error',
				content: 'Las contraseñas no son iguales'
			})
		}else{
			setLoading(true)
			const data = {
				idType: idType,
				id: idNumber,
				name: name,
				lastname: lastname,
				password: await encrypt(password),
				userType: userType
			}

			const res = await createUser(data)
			if(res.status == 200){
				setLoading(false)
				messageApi.open({
					type: 'success',
					content: 'Usuario creado con exito'
				})
				updateList()
				onCancel()
			}else{
				setLoading(false)
				messageApi.open({
					type: 'error',
					content: res.response.data
				})
			}
		}
	}

	return(
		<Modal
			title='Agregar nuevo usuario'
			open={open} 
			closable={false}
			destroyOnClose
			footer={[
				<Button onClick={cleanForm} variant='link' color='danger'>Cancelar</Button>,
				<Button disabled={loading ||idType=='' || idNumber=='' || name=='' || lastname=='' || password == '' || confirmPassword==''} onClick={submitNewUser} variant='solid' color='primary'>Agregar</Button>
			]}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
				<Space.Compact style={{width: '100%'}}>
					<Select onChange={(e) => setIdType(e)} placeholder='Tipo de identificacion' style={{width: '50%'}} options={lists.identificationList.slice(0, 2)}/>
					<InputNumber onBlur={(e) => {findUser(Number(e.target.value))}} onChange={(e) => setIdNumber(e)} placeholder='Numero' style={{width: '50%'}}/>
				</Space.Compact>
				<Space.Compact style={{width: '100%'}}>
					<Input disabled={loading} onChange={(e) => setName(e.target.value)} placeholder='Nombre' style={{width: '50%'}}/>
					<Input disabled={loading} onChange={(e) => setLastname(e.target.value)} placeholder='Apellido' style={{width: '50%'}}/>
				</Space.Compact>
				
				<Input.Password disabled={loading} placeholder='Contraseña' onChange={(e) => setPassword(e.target.value)}/>
				<Input.Password disabled={loading} placeholder='Confirmar contraseña' onChange={(e) => setConfirmPassword(e.target.value)}/>
				<Select disabled={loading} onChange={(e) => setUserType(e)} placeholder='Tipo de Usuario' options={lists.userTypeList.slice(0, 5)}/>
			</div>
		</Modal>
	)
}

export const DeleteUserModal = ({open, onCancel, id, updateList}) => {

	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		setLoading(true)
		let res = await deleteUser(id)
		if(res.status == 200){
			messageApi.open({
				type: 'success',
				content: 'Eliminado con exito'
			})
			setLoading(false)
			updateList()
			onCancel()
		}else{
			setLoading(false)
			messageApi.open({
				type: 'error',
				content: 'ah ocurrido un error'
			})
		}
	}

	return(
		<Modal
			destroyOnClose
			open={open}
			closable={false}
			title='¿Desea desactivar este usuario?'
			footer={[
				<Button disabled={loading} variant='text' color='primary' onClick={onCancel}>Cancelar</Button>,
				<Button disabled={loading} variant='solid' color='danger' onClick={handleDelete}>Eliminar</Button>
			]}
		></Modal>
	)
}

export const ReactivateUserModal = ({open, onCancel, updateList, id}) => {
	
	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const submitReactivation = async () => {
		if(newPassword == ''){
			messageApi.open({
				type: 'error',
				content: 'Ingrese una contraseña'
			})
		}else if(newPassword!=confirmPassword){
			messageApi.open({
				type: 'error',
				content: 'Las contraseñas no son iguales'
			})
		}else{
			const data = {
				id: id,
				newPassword: await encrypt(newPassword)
			}
			let res = await reactivateUser(data)
			if(res.status == 200){
				setLoading(false)
				setNewPassword('')
				messageApi.open({
					type: 'success',
					content: 'Usuario reactivado'
				})
				updateList()
				onCancel()
			}else{
				setLoading(false)
				messageApi.open({
					type: 'error',
					content: 'ah ocurrido un error'
				})
			}
		}
		
	}

	return(
		<Modal
			title='¿Desea reactivar ha este usuario?'
			destroyOnClose
			open={open}
			closable={false}
			footer={[
				<Button variant='text' color='primary' onClick={() => {onCancel(); setNewPassword(false)}}>Cancelar</Button>,
				<Button variant='solid' color='primary' onClick={submitReactivation}>Reactivar</Button>
			]}
		>
			<Space.Compact style={{width: '100%', margin: '1%'}}>
				<Input.Password placeholder='Nueva contraseña' onChange={(e) => setNewPassword(e.target.value)}/>
			</Space.Compact>
			<Space.Compact style={{width: '100%', margin: '1%'}}>
				<Input.Password placeholder='Confirmar nueva contraseña' onChange={(e) => setConfirmPassword(e.target.value)}/>
			</Space.Compact>
		</Modal>
	)
}

export const ChangePasswordModal = ({open, onCancel, info}) => {

	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const submitPasswordChange = async () => {
		if(newPassword == ''){
			messageApi.open({
				type: 'error',
				content: 'Ingrese una contraseña'
			})
		}else if(newPassword!=confirmPassword){
			messageApi.open({
				type: 'error',
				content: 'Las contraseñas no son iguales'
			})
		}else{
			const data = {
				userId: info.id,
				newPassword: await encrypt(newPassword)
			}
			let res = await changePassword(data)
			if(res.status == 200){
				messageApi.open({
					type: 'success',
					content: 'Contraseña actualizada'
				})
				setLoading(false)
				onCancel()
			}else{
				setLoading(false)
				messageApi.open({
					type: 'error',
					content: res.response.data
				})
			}
		}
	}

	return(
		<Modal
			destroyOnClose
			closable={false}
			title='Cambiar contraseña del usuario'
			open={open}
			footer={[
				<Button variant='text' color='danger' onClick={onCancel} disabled={loading}>Cancelar</Button>,
				<Button
					type='primary'
					onClick={submitPasswordChange}
					disabled={loading || newPassword == ''}
				>Aceptar</Button>
			]}
		>
			<Space.Compact style={{width: '100%', margin: '1%'}}>
				<Input.Password placeholder='Nueva contraseña' onChange={(e) => setNewPassword(e.target.value)}/>
			</Space.Compact>
			<Space.Compact style={{width: '100%', margin: '1%'}}>
				<Input.Password placeholder='Confirmar nueva contraseña' onChange={(e) => setConfirmPassword(e.target.value)}/>
			</Space.Compact>
		</Modal>
	)
}

export const ChangeUserTypeModal = ({open, onCancel, info}) => {

	const [loading, setLoading] = useState(false)
	const [selectedType, setSelectedType] = useState(info.type)
	const {messageApi} = useContext(appContext)

	const submitChangeType = async () => {
		setLoading(true)
		const data = {
			userId: info.id,
			newType: selectedType
		}
		let res = await changeUserType(data)
		if(res.status == 200){
			setLoading(false)
			onCancel()
			messageApi.open({
				type: 'success',
				content: 'Usuario actualizado'
			})
		}else{
			setLoading(false)
			messageApi.open({
				type: 'error',
				content: res.response.data
			})
		}
	}
	return(
		<Modal
			destroyOnClose
			title='Cambiar tipo de usuario'
			closable={false}
			open={open}
			footer={[
				<Button variant='text' color='danger' onClick={() => {onCancel(); setSelectedType('')}} disabled={loading}>Cancelar</Button>,
				<Button
					type='primary'
					onClick={submitChangeType}
					disabled={loading}
				>Aceptar</Button>
			]}
		>
			<Select 
				options={lists.userTypeList}
				onChange={(e) => setSelectedType(e)}
				defaultValue={info.type}
			/>
		</Modal>
	)
}