import { Modal, Button, Input, InputNumber, Select, Form, Space, message, List, DatePicker } from 'antd'
import { useState, useEffect, useContext, act } from 'react'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import { encrypt } from '../functions/hash'
import { verifyInvoice, deleteUser, createStudent, changePassword, changeUserType ,openPeriod, changeEndDatePeriod, getIdUsers, createNewModule, getAllModules, assignModuleToCourse, getAssignedModules} from '../client/client'
import React from 'react'
import { routerContext } from '../context/routerContext'
import { getDate, getTime } from '../functions/formatDateTime'
import InputPhone from "../components/InputPhone"

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

export const AddNewStudent = ({open, onCancel, updateList}) => {

	//Control de la UI
	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	//Control de los campos
	const [idNumber, setIdNumber] = useState('')
	const [name, setName] = useState('')
	const [lastname, setLastname] = useState('')
	const [birthDate, setBirthDate] = useState("")
	const [email, setEmail] = useState("")
	const [phone, setPhone] = useState("")
	const [address, setAddress] = useState('')
	const [instructionGrade, setInstructionGrade] = useState("")

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
		setIdNumber('')
		setName('')
		setLastname('')
		setBirthDate("")
		setEmail("")
		setPhone("")
		setInstructionGrade("")
		setAddress('')
		onCancel()
	}

	const submitNewStudent = async () => {
		if(birthDate=='' || idNumber=='' || name=='' || lastname=='' || email == '' || phone=='' || instructionGrade == "" || address == ""){
			messageApi.open({
				type: 'error',
				content: 'Debe ingresar todos los datos'
			})
		}else{
			setLoading(true)
			const data = {
				identification: idNumber,
				name: name,
				lastName: lastname,
				birthDate: `${birthDate.$y}/${birthDate.$M}/${birthDate.$D + 1}`,
				email: email,
				phone: phone,
				address: address,
				instructionGrade: instructionGrade
			}

			const res = await createStudent(data)
			if(res.status == 200){
				setLoading(false)
				messageApi.open({
					type: 'success',
					content: 'Estudiante registrado con exito'
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
				<Button disabled={loading ||birthDate=='' || idNumber=='' || name=='' || lastname=='' || email == '' || phone == '' || address == "" || instructionGrade == ""} onClick={submitNewStudent} variant='solid' color='primary'>Agregar</Button>
			]}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
				<InputNumber onBlur={(e) => {findUser(Number(e.target.value))}} onChange={(e) => setIdNumber(e)} placeholder='Numero' style={{width: '50%'}}/>
				<Space.Compact style={{width: '100%'}}>
					<Input disabled={loading} onChange={(e) => setName(e.target.value)} placeholder='Nombre' style={{width: '50%'}}/>
					<Input disabled={loading} onChange={(e) => setLastname(e.target.value)} placeholder='Apellido' style={{width: '50%'}}/>
				</Space.Compact>

				Fecha de Nacimiento:
				<DatePicker
					onChange={e => setBirthDate(e)}
				/>

				Telefono:
				<InputPhone
					value={phone}
					setter={(p) => setPhone(p)}
				/>

				<Input
					placeholder='Correo electronico'
					value={email}
					onChange={e => setEmail(e.target.value)}	
				/>

				<Input.TextArea
					placeholder='Direccion'
					value={address}
					onChange={e => setAddress(e.target.value)}	
				/>

				<Select
					options={lists.instructionGradeList}
					onChange={e => setInstructionGrade(e)}
					defaultValue={{value: 0, label: "Grado de instruccion"}}/>
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

export const EditCourse = ({open, onCancel, selectedCourse}) => {

	const [showList, setShowList] = useState([])
	const [modulesList, setModulesList] = useState([])
	const [selectedModule, setSelectedModule] = useState([])
	
	async function getModules(){
		const res = await getAllModules()
		if(res.status == 200){
			const optionsList = res.data.map(item => ({value: item.id, label: item.description}))
			setModulesList(optionsList)
		}
	}

	async function assignNewModule(){
		const data = {
			moduleId: selectedModule,
			courseId: selectedCourse
		}
		const res = await assignModuleToCourse(data)
		if(res.status == 200){
			getModulesForCourse()
		}
	}

	async function getModulesForCourse(){
		const data = {
			courseId: selectedCourse
		}
		const res = await getAssignedModules(data)
		if(res.status == 200){
			setShowList(res.data)
		}
	}
	
	useEffect(() => {
		getModules()
		getModulesForCourse()
	}, [selectedCourse])

	return(
		<Modal
			open={open}
			onCancel={onCancel}
			destroyOnHidden
		>
			<h1>Lista de Modulos</h1>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: '5px'}}>
				<Select
					style={{width: '70%'}}
					defaultValue={"Seleccione un Modulo"}
					options={modulesList}
					onChange={e => setSelectedModule(e)}/>
				<Button onClick={() => assignNewModule()}>Agregar</Button>
			</div>

			{showList.length === 0 ? (
				<h2>Este curso aun no tiene modulos</h2>
			):(
				<List bordered size='small'>
				{showList.map((item) => (
					<List.Item>
						<h3>{lists.searchOnList(modulesList, item.moduleid)}</h3>
						<Button>Retirar modulo</Button>
					</List.Item>
				))}
				</List>
			)}
		</Modal>
	)
}

export const AddNewModule = ({open, onCancel, action}) => {

	const [moduleName, setModuleName] = useState("")

	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title="Agregar nuevo modulo"
			onOk={() => action({description: moduleName})}
		>
			<Input
				placeholder='Nombre del modulo'
				onChange={e => setModuleName(e.target.value)}	
			/>
		</Modal>
	)
}

export const AddNewCourse = ({open, onCancel, action}) => {

	const [moduleName, setModuleName] = useState("")

	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title="Agregar nuevo curso"
			onOk={() => action({description: moduleName})}
		>
			<Input
				placeholder='Nombre del curso'
				onChange={e => setModuleName(e.target.value)}	
			/>
		</Modal>
	)
}

export const AddStudentToModule = ({open, onCancel, info}) => {
	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title="Inscribir alumno al modulo"
		>
			<Input 
				placeholder="Cedula del estudiante"
			/>
			<Button>Verificar estudiante</Button>
		</Modal>
	)
}

export const RetireStudentFromModule = ({open, onCancel, info}) => {
	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title="Retirar al alumndo del modulo?"
		>
			
		</Modal>
	)
}

export const ManagePeriodModal = ({open, period, onCancel}) => {

	const [loading, setLoading] = useState(false)
	const [year, setYear] = useState('')
	const [periodId, setPeriodId] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const {messageApi} = useContext(appContext)

	const submitChangeType = async () => {
		setLoading(true)
		if(period){
			const data = {
				year: period.year,
				periodId: period.period,
				endDate: endDate
			}
			const res = await changeEndDatePeriod(data)
			setLoading(false)
			if(res.status == 200){
				messageApi.open({
					type: 'success',
					content: 'Se ha cambiado la fecha de culminacion del periodo'
				})
				onCancel()	
			}else{
				messageApi.open({
					type: 'error',
					content: res.response.data
				})
			}
		}else{
			const data = {
				year: year,
				periodId: periodId,
				startDate: startDate,
				endDate: endDate
			}
			const res = await openPeriod(data)
			setLoading(false)
			if(res.status == 200){
				messageApi.open({
					type: 'success',
					content: 'Periodo iniciado con exito'
				})
				onCancel()	
			}else{
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
			title='Gestion de periodo academico'
			closable={false}
			open={open}
			footer={[
				<Button variant='text' color='danger' onClick={() => {onCancel()}} disabled={loading}>Cancelar</Button>,
				<Button
					type='primary'
					onClick={submitChangeType}
					disabled={loading}
				>Aceptar</Button>
			]}
		>

			{period ? (
				<DatePicker style={{width: '150px'}} onChange={e => setEndDate(e)}/>
			) : (
				<>
				<Form>
					<Form.Item label='Año del periodo'>
						<DatePicker style={{width: '150px'}}  picker="year" onChange={e => setYear(e)}/>
					</Form.Item>
					<Form.Item label='Periodo (1 o 2)'>
						<Select placeholder='Periodo (1 o 2)' options={[{value: 1, label: 1}, {value: 2, label: 2}]} onChange={e => setPeriodId(e)} />
					</Form.Item>
					<Form.Item label='Fecha de inicio del periodo'>
						<DatePicker style={{width: '150px'}} onChange={e => setStartDate(e)}/>
					</Form.Item>
					<Form.Item label='Fecha de fin del periodo'>
						<DatePicker style={{width: '150px'}} onChange={e => setEndDate(e)}/>
					</Form.Item>
				</Form>
				</>
			)}
		</Modal>
	)
}

