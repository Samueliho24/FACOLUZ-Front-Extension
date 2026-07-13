import { openSection, closeSection, getDocument, uploadStudentDocument, getStudentDocuments, getSectionByPeriod } from '../client/client'
import { Modal, Button, Input, InputNumber, Select, Form, Space, message, List, DatePicker, Tooltip, Divider, Descriptions, Table, Spin, Empty } from 'antd'
import { useState, useEffect, useContext, useMemo, act } from 'react'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import { encrypt } from '../functions/hash'
import { verifyInvoice, deleteUser, createStudent, changePassword, changeUserType ,openPeriod, closePeriod, changeEndDatePeriod, getIdUsers, createNewModule, getAllModules, getAssignedModules, updateAssignedModules, getPaymentsForInvoice, makePayment, getDolarPrice, updatePhoto,createTeacher, deactivateTeacher, deactivateStudent, getStudentsInSection, getActivePeriods, setLoadScores, getScoreByStudent,setUpdateScore, getGradeStudentsBySection} from '../client/client'
import React from 'react'
import { routerContext } from '../context/routerContext'
import { getDate, getTime } from '../functions/formatDateTime'
import InputPhone from "../components/InputPhone"
import InputGrade from './InputGrade'
import TextArea from 'antd/es/input/TextArea'
import { mergeDate } from '../functions/formatDateTime'
import dayjs from 'dayjs';
import { ConsoleSqlOutlined, DownloadOutlined } from "@ant-design/icons"

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
		</Modal>
	)
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
				<InputNumber onBlur={(e) => {findUser(Number(e.target.value))}} onChange={(e) => setIdNumber(e)} placeholder='Numero de cedula' style={{width: '100%'}}/>
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
					type='email'	
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

export const DeleteUserModal = ({open, onCancel, user, updateList}) => {

	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleDelete = async () => {
		setLoading(true)
		const newData = user;
		newData.active = false;
		let res = await updateUser(newData)
		if(res.status == 201){
			messageApi.open({
				type: 'success',
				content: 'Acceso eliminado con exito'
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

export const AddNewUserModal = ({open, onCancel, updateList}) => {

	//Control de la UI
	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	//Control de los campos
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
		setIdNumber('')
		setName('')
		setLastname('')
		setPassword('')
		setConfirmPassword('')
		setUserType('')
		onCancel()
	}

	const submitNewUser = async () => {
		if(idNumber=='' || name=='' || lastname=='' || password == '' || confirmPassword==''){
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
				id: idNumber,
				name: name,
				lastname: lastname,
				passwordSHA256: await encrypt(password),
				type: userType,
			}

			const res = await createUser(data)
			if(res.status == 201){
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
				<Button disabled={loading || idNumber=='' || name=='' || lastname=='' || password == '' || confirmPassword==''} onClick={submitNewUser} variant='solid' color='primary'>Agregar</Button>
			]}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
					<InputNumber onBlur={(e) => {findUser(Number(e.target.value))}} onChange={(e) => setIdNumber(e)} placeholder='Numero de cedula' style={{width: '100%'}}/>
				<Space.Compact style={{width: '100%'}}>
					<Input disabled={loading} onChange={(e) => setName(e.target.value)} placeholder='Nombre' style={{width: '50%'}}/>
					<Input disabled={loading} onChange={(e) => setLastname(e.target.value)} placeholder='Apellido' style={{width: '50%'}}/>
				</Space.Compact>
				
				<Input.Password disabled={loading} placeholder='Contraseña' onChange={(e) => setPassword(e.target.value)}/>
				<Input.Password disabled={loading} placeholder='Confirmar contraseña' onChange={(e) => setConfirmPassword(e.target.value)}/>
				<Select disabled={loading} onChange={(e) => setUserType(e)} placeholder='Tipo de Usuario' options={lists.userTypeList.slice(1, 3)}/>
			</div>
		</Modal>
	)
}

export const EditCourse = ({open, onCancel, selectedCourse}) => {

	const {messageApi} = useContext(appContext)

	const [showList, setShowList] = useState([])
	const [modulesList, setModulesList] = useState([])
	const [selectedModule, setSelectedModule] = useState([])
	const [orderModule,setOrderModule] = useState(null)
	
	async function getModules(){
		const res = await getAllModules()
		if(res.status == 200){
			const optionsList = res.data.map(item => ({value: item.id, label: item.description}))
			setModulesList(optionsList)
		}
	}

	async function assignNewModule(){
		const moduleValue = selectedModule?.value ?? selectedModule
		if(!moduleValue){
			messageApi.open({type: 'error', content: 'Seleccione un módulo'})
			return
		}
		if (showList?.some(item => String(item.moduleid) === String(moduleValue))) {
			messageApi.open({type: 'error', content: 'El módulo ya está asignado a este curso'})
			return
		}

		const newItem = { moduleid: moduleValue }
		setShowList(prev => {
			const newList = [...prev];
			newList.splice((orderModule && orderModule>0) ? orderModule-1 : newList.length, 0, newItem); 
			return newList})
		console.log(showList)
		setSelectedModule(null)
		setOrderModule(null)
	}

	function removeModule(moduleId){
		setShowList(prev => prev.filter(i => String(i.moduleid) !== String(moduleId)))
	}

	async function submitModules(){
		const moduleIds = showList.map(i => i.moduleid)
		const data = { courseId: selectedCourse, moduleIds }
		const res = await updateAssignedModules(data)
		if(res.status == 200){
			messageApi.open({type: 'success', content: 'Módulos actualizados'})
			// refresh from server to get ids, etc.
			getModulesForCourse()
			onCancel()
		}else{
			messageApi.open({type: 'error', content: 'Error al actualizar módulos'})
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
			footer={[
				<Button key="cancel" onClick={onCancel}>Cancelar</Button>,
				<Button key="submit" type="primary" onClick={submitModules}>Aceptar</Button>
			]}
		>
			<h1>Lista de Modulos</h1>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: '5px'}}>
				<Select
					style={{width: '70%'}}
					defaultValue={"Seleccione un Modulo"}
					options={modulesList}
					onChange={e => setSelectedModule(e)}/>
				<InputNumber style={{width: '20%'}} placeholder='Posicion del modulo' value={orderModule} onChange={e => setOrderModule(e)} maxLength={2}/>
				<Button onClick={() => assignNewModule()}>Agregar</Button>
			</div>

			{showList.length === 0 ? (
				<h2>Este curso aun no tiene modulos</h2>
			):(
				<List bordered size='small'>
				{showList.map((item) => (
					<List.Item key={item.moduleid}>
						<h3>{lists.searchOnList(modulesList, item.moduleid)}</h3>
						<Button onClick={() => removeModule(item.moduleid)}>Retirar módulo</Button>
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
			destroyOnHidden
		>
			<Input
				placeholder='Nombre del modulo'
				onChange={e => setModuleName(e.target.value)}	
			/>
		</Modal>
	)
}

export const DesactivateModuleModal = ({open, onCancel, module, action}) => {

	const {messageApi} = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleDesactivate = async () => {
		setLoading(true)
		try{
			if(typeof action === 'function'){
				const res = await action(module?.id ?? module)
				setLoading(false)
				if(res && res.status === 200){
					messageApi.open({type: 'success', content: 'Módulo suspendido'})
					onCancel()
				}else{
					messageApi.open({type: 'error', content: res?.response?.data || 'Error al suspender el módulo'})
				}
			}else{
				setLoading(false)
				messageApi.open({type: 'error', content: 'Acción no disponible'})
			}
		}catch(err){
			setLoading(false)
			console.log(err)
			messageApi.open({type: 'error', content: 'Error del servidor'})
		}
	}

	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title='Suspender módulo'
			destroyOnClose
			footer={[
				<Button key="cancel" onClick={onCancel} disabled={loading}>Cancelar</Button>,
				<Button key="desactivate" type='primary' color='danger' onClick={handleDesactivate} disabled={loading}>Suspender módulo</Button>
			]}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
				<p>¿Desea suspender el módulo <strong>{module?.description ?? module?.name ?? ''}</strong>?</p>
				<p>Esta acción evitará que el módulo esté disponible para nuevas asignaciones.</p>
			</div>
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
			destroyOnHidden
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
			destroyOnHidden
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

export const DeactivateStudentModal = ({open, onCancel, studentId, updateList}) => {
    const { messageApi } = useContext(appContext)
    const [loading, setLoading] = useState(false)

    const handleDeactivate = async () => {
        setLoading(true)
        const res = await deactivateStudent(studentId)
        if(res.status === 200){
            messageApi.open({ type: 'success', content: 'Estudiante desactivado correctamente' })
            setLoading(false)
            updateList()
            onCancel()
        }else{
            messageApi.open({ type: 'error', content: 'Error al desactivar estudiante' })
            setLoading(false)
        }
    }

    return(
        <Modal
            title='¿Desea desactivar este estudiante?'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button onClick={onCancel} variant='text' color='primary' disabled={loading}>Cancelar</Button>,
                <Button onClick={handleDeactivate} variant='solid' color='danger' disabled={loading}>Desactivar</Button>
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <p>Esta acción marcará al estudiante como inactivo y no podrá ser inscrito en nuevos módulos.</p>
            </div>
        </Modal>
    )
}

export const UpdatePhoto = ({open, onCancel, studentId}) => {

	const [loading, setLoading] = useState(false)
	const {messageApi} = useContext(appContext)

	async function upload(){
		setLoading(true)
		const picInput = document.getElementById("picInput").files[0]
		const formData = new FormData
		formData.append("file", picInput)
		const res = await updatePhoto(formData, studentId)
		setLoading(false)
		if(res.status == 201){
			messageApi.open({
				type: "success",
				content: "Foto actualizada con exito"
			})
			onCancel()
		}else{
			messageApi.open({
				type: "error",
				content: "ha ocurrido un error"
			})
			onCancel()
		}
	}

	return(
		<Modal
			open={open}
			onCancel={() => onCancel()}
			destroyOnHidden
			title="Selecciona una foto para subir"
			footer={[
				<Button onClick={upload}>
					Actualizar foto
				</Button>
			]}
		>
			<input type='file' id="picInput"/>
		</Modal>
	)
}

export const OpenPeriodModal = ({open, period, onCancel, refreshPeriods}) => {

	const [loading, setLoading] = useState(false)
	const [year, setYear] = useState('')
	const [periodId, setPeriodId] = useState('')
	const [modality, setModality] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const {messageApi} = useContext(appContext)

	// Recibe el callback para actualizar la lista
	
	const submitChangeType = async () => {
		setLoading(true)
		const data = {
			year: year,
			period: periodId,
			modality: modality,
			startDate: startDate,
			endDate: endDate
		}
		const res = await openPeriod(data)
		console.log(res)
		setLoading(false)
		if(res.status == 200){
			messageApi.open({
				type: 'success',
				content: 'Periodo iniciado con exito'
			})
			onCancel()
			refreshPeriods()    
		}else{
			messageApi.open({
				type: 'error',
				content: "ha ocurrido un error"
			})
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
					<Form.Item label='Periodo'>
						<DatePicker.MonthPicker format="MMM-YYYY" style={{width: '150px'}}  onChange={e => {setYear(e.year());setPeriodId(e.month()+1);}}/>
					</Form.Item>
					<Form.Item label= 'Modalidad'>
						<Select
							placeholder='Modalidad'
							value={modality ? modality : undefined}
							onChange={setModality}
							options={[{value:'Intensivo',label:'Intensivo'},{value:'Sabatino',label:'Sabatino'}]}
						/>
					</Form.Item>
					<Form.Item label='Fecha de inicio del periodo'>
						<DatePicker format="DD/MM/YYYY" style={{width: '150px'}} onChange={e => setStartDate(e)}/>
					</Form.Item>
					<Form.Item label='Fecha de fin del periodo'>
						<DatePicker format="DD/MM/YYYY" style={{width: '150px'}} onChange={e => setEndDate(e)}/>
					</Form.Item>
				</Form>
				</>
			)}
		</Modal>
	)
}

export const ClosePeriodModal = ({open, onCancel, period, refreshPeriods}) => {
	const { messageApi } = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleClose = async () => {
		if (!period) return;
		setLoading(true)
		try {
			const res = await closePeriod({ year: period.year, period: period.period })
			if (res.status === 200) {
				messageApi.success('Periodo cerrado exitosamente')
				onCancel()
				refreshPeriods()
			} else {
				messageApi.error('Error al cerrar el periodo')
			}
		} catch (err) {
			messageApi.error('Error al cerrar el periodo')
		}
		setLoading(false)
	}

	return (
		<Modal
			title={`¿Desea cerrar el periodo ${period ? (period.year + ' - ' + period.period) : ''}?`}
			open={open}
			closable={false}
			destroyOnClose
			footer={[
				<Button key="cancel" onClick={onCancel} variant='text' disabled={loading}>Cancelar</Button>,
				<Button key="close" onClick={handleClose} variant='solid' color='danger' disabled={loading}>Cerrar periodo</Button>
			]}
		>
			<p>Esta acción marcará el periodo como finalizado y no podrá ser modificado.</p>
		</Modal>
	)
}

export const OpenSectionModal = ({ open, section, onCancel, refreshSections }) => {
    const { messageApi, currentPeriodSection, moduleList, teacherList } = useContext(appContext)
    const [loading, setLoading] = useState(false)
    const [periodId, setPeriodId] = useState('')
    const [moduleId, setModuleId] = useState('')
    const [primaryTeacherId, setPrimaryTeacherId] = useState('')
    const [secondaryTeacherId, setSecondaryTeacherId] = useState('')
    const [code, setCode] = useState('')
    const [quota, setQuota] = useState('')

    const selectedModule = useMemo(() => {
        return moduleList.find(m => m.id === moduleId) || null
    }, [moduleId, moduleList])

    const isAverageMode = selectedModule?.evaluationMode === 'Promedio'

    useEffect(() => {
        if (currentPeriodSection) {
            setPeriodId(currentPeriodSection.id || currentPeriodSection.periodId || '')
        }
        if (!open) {
            setModuleId('');
            setPrimaryTeacherId('');
            setSecondaryTeacherId('');
            setCode('');
            setQuota('');
        }
    }, [currentPeriodSection, open])

    const handleAddSection = async () => {
        const teachers = []
        if (primaryTeacherId) {
            teachers.push({ id: primaryTeacherId })
        }
        if (isAverageMode && secondaryTeacherId && secondaryTeacherId !== primaryTeacherId) {
            teachers.push({ id: secondaryTeacherId })
        }

        const data = {
            periodId,
            moduleId,
            teachers,
            code,
            quota: Number(quota)
        }

        setLoading(true)
        try {
            const res = await openSection(data)
            if (res.status === 200) {
                messageApi.success('Sección creada correctamente')
                onCancel()
                refreshSections()
            } else {
                messageApi.error('Error al crear la sección')
            }
        } catch (err) {
            messageApi.error('Error al crear la sección')
        }
        setLoading(false)
    }

    const availableSecondaryTeachers = useMemo(() => {
        return teacherList.filter(t => t.id !== primaryTeacherId)
    }, [teacherList, primaryTeacherId])

    const isFormValid = useMemo(() => {
        const baseValid = periodId && moduleId && primaryTeacherId && code && quota
        if (isAverageMode) {
            return baseValid && secondaryTeacherId
        }
        return baseValid
    }, [periodId, moduleId, primaryTeacherId, secondaryTeacherId, code, quota, isAverageMode])

    return (
        <Modal
            title='Agregar nueva sección'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button key="cancel" onClick={onCancel} variant='text' disabled={loading}>Cancelar</Button>,
                <Button key="add" onClick={handleAddSection} variant='solid' color='primary' disabled={loading || !isFormValid}>Agregar</Button>
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Select
                    placeholder='Módulo'
                    value={moduleId ? moduleId : undefined}
                    onChange={(value) => {
                        setModuleId(value)
                        setPrimaryTeacherId('')
                        setSecondaryTeacherId('')
                    }}
                    options={moduleList.map(m => ({ 
                        value: m.id, 
                        label: `${m.description}` 
                    }))}
                />

                <Select
                    placeholder='Docente principal'
                    value={primaryTeacherId ? primaryTeacherId : undefined}
                    onChange={(value) => {
                        setPrimaryTeacherId(value)
                        if (secondaryTeacherId === value) {
                            setSecondaryTeacherId('')
                        }
                    }}
                    options={teacherList.map(t => ({ value: t.id, label: `${t.name} ${t.lastName}` }))}
                    disabled={!moduleId}
                />

                {isAverageMode && (
                    <Select
                        placeholder='Docente secundario'
                        value={secondaryTeacherId ? secondaryTeacherId : undefined}
                        onChange={setSecondaryTeacherId}
                        options={availableSecondaryTeachers.map(t => ({ 
                            value: t.id, 
                            label: `${t.name} ${t.lastName}` 
                        }))}
                        disabled={!primaryTeacherId}
                    />
                )}
                <Input 
                    placeholder='Código de sección' 
                    value={code} 
                    onChange={e => setCode(e.target.value.toUpperCase())} 
                    maxLength={1} 
                />
                <InputNumber 
                    placeholder='Cupo' 
                    value={quota} 
                    onChange={setQuota} 
                    min={1} 
                    style={{ width: '100%' }} 
                />
            </div>
        </Modal>
    )
}
export const CloseSectionModal = ({open, onCancel, section, refreshSections}) => {
	const { messageApi } = useContext(appContext)
	const [loading, setLoading] = useState(false)

	const handleClose = async () => {
		if (!section) return;
		setLoading(true)
		try {
			const res = await closeSection({ sectionId: section.id })
			if (res.status === 200) {
				messageApi.success('Sección cerrada exitosamente')
				onCancel()
				refreshSections()
			} else {
				messageApi.error('Error al cerrar la sección')
			}
		} catch (err) {
			messageApi.error('Error al cerrar la sección')
		}
		setLoading(false)
	}

	return (
		<Modal
			title={`¿Desea cerrar la sección ${section ? section.code: ''}?`}
			open={open}
			closable={false}
			destroyOnClose
			footer={[
				<Button key="cancel" onClick={onCancel} variant='text' disabled={loading}>Cancelar</Button>,
				<Button key="close" onClick={handleClose} variant='solid' color='danger' disabled={loading}>Cerrar sección</Button>
			]}
		>
			<p>Esta acción marcará la sección como finalizada y no podrá ser modificada.</p>
		</Modal>
	)
}

export const InfoForInvoice = ({open, onCancel, Invoice}) => {
	
	const { dolarPrice } = useContext(appContext)
	const [showList, setShowList] = useState([])
	const [remainingDebt, setRemainingDebt] = useState(0)

	async function getInfo(){
		const res = await getPaymentsForInvoice(Invoice.id)
		console.log(res)
		if(res.status == 200){
			setShowList(res.data)
		}
		let paid = 0
		if(res.data.length >= 1){
			res.data.forEach((item) => {
				paid += item.paidAmount
				let remaining = Invoice.chargedAmount - paid
				console.log(remaining)
				setRemainingDebt(remaining)
			});
		}else if(Invoice !== null){
			setRemainingDebt(Invoice.chargedAmount)
		}

	}

	useEffect(() => {
		getInfo()
	}, [Invoice])

	return(
		<Modal
			open={open}
			onCancel={() => onCancel()}
			destroyOnHidden
			title="Historial de pagos"
		>
			<h4>Restante: Bs. ${(remainingDebt * dolarPrice).toFixed(2)} (${remainingDebt.toFixed(2)})</h4>
			{showList.length > 0 ?(
				<List bordered>
					{showList.map((item) => (
						<List.Item>
							<p>{mergeDate(item.date)} - Pagado: ${item.paidAmount} - {item.receivedPaymentMethod} - Tasa: {item.changeRate} Bs/$</p>
						</List.Item>
					))}
				</List>
			):(
				<h3>No hay pagos para mostrar</h3>
			)}
			
		</Modal>
	)
}

export const MakePayment = ({open, onCancel, Invoice, updateList}) => {

	const {messageApi} = useContext(appContext)

	const [paymentMethod, setPaymentMethod] = useState()
	const [changeMethod, setChangeMethod] = useState()
	const [paymentSuffix, setPaymentSuffix] = useState("")
	const [changeSuffix, setChangeSuffix] = useState("")
	const [changeRate, setChangeRate] = useState(0)

	useEffect(() => {
		getDolar()
	}, [])

	async function getDolar(){
		const res = await getDolarPrice()
		setChangeRate(res)
	}

	const updatePaymentMethod = (e) => {
		console.log(Invoice)
		setPaymentMethod(e)
		switch(e){
			case (1 || 2): 
				setPaymentSuffix("Bs")
				break
			case (3 || 4): 
				setPaymentSuffix("$")
				break
		}
	}

	const updateChangeMethod = (e) => {
		setChangeMethod(e)
		switch(e){
			case (1 || 2):
				setChangeSuffix("Bs")
				break
			case (3 || 4): 
				setChangeSuffix("$")
				break
		}
	}

	async function submit(){

		const paymentAmount = document.getElementById("paymentAmount").value
		const changeAmount = document.getElementById("changeAmount").value
		const comments = document.getElementById("comments").value
		const reference = document.getElementById("reference").value

		const data = {
			InvoiceId: Invoice.id,
			paymentAmmount: paymentAmount,
			paymentMethod: paymentMethod,
			reference: reference,
			changeAmount: changeAmount == "" ? 0 : changeAmount,
			changeMethod: changeMethod ? changeMethod : null,
			comments: comments,
			changeRate: changeRate
		}

		console.log(data)

		const res = await makePayment(data)
		if(res.status == 201){
			messageApi.open({
				type: 'success',
				content: 'Pago realizado con exito'
			})
			updateList()
			onCancel()
		}else{
			messageApi.open({
				type: 'error',
				content: 'ha ocurrido un error al registar el pago'
			})
			onCancel()
		}
	}

	return (
		<Modal
			open={open}
			onCancel={() => onCancel()}
			destroyOnHidden
			title="Realizar pago"
			onOk={() => submit()}
		>
			<div style={{width: "100%"}}>
				<Space.Compact style={{width: "100%"}}>
					<InputNumber
						placeholder='monto:'
						suffix={paymentSuffix}
						id='paymentAmount'
					/>
					<Select 
						defaultValue="Moneda"
						options={lists.paymentMethods}
						value={paymentMethod}
						onChange={e => updatePaymentMethod(e)}
					/>
				</Space.Compact>
				<Input 
					placeholder='Referencia:'
					id='reference'
				/>
				<Space.Compact  style={{width: "100%"}}>
					<InputNumber
						placeholder='cambio'
						suffix={changeSuffix}
						id='changeAmount'
					/>
					<Select 
						defaultValue="Moneda"
						options={lists.paymentMethods}
						value={changeMethod}
						onChange={e => updateChangeMethod(e)}
					/>
				</Space.Compact>
				<TextArea 
					placeholder='Observaciones:'
					id='comments'
				/>
			</div>
		</Modal>
	)
}

export const EditPeriodModal = ({open, onCancel, period, refreshPeriods}) => {
    const { messageApi } = useContext(appContext);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(period?.endDate || '');
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        setEndDate(period?.endDate || '');
        setChanged(false);
    }, [period, open]);

    if (!period) return null;

    // Detecta si la nueva fecha es diferente a la anterior y válida
    const handleDateChange = (e) => {
        const newDate = e ? e.format('YYYY-MM-DD') : '';
        setEndDate(newDate);
        setChanged(newDate && newDate !== period.endDate);
    };

    const handleChangeEndDate = async () => {
        setLoading(true);
        try {
            const data = {
                year: period.year,
                period: period.period,
                newEndDate: endDate
            };
            const res = await changeEndDatePeriod(data);
            if (res.status === 200) {
                messageApi.success('Fecha de fin actualizada');
                onCancel();
                refreshPeriods();
            } else {
                messageApi.error('Error al actualizar la fecha de fin');
            }
        } catch (err) {
            messageApi.error('Error al actualizar la fecha de fin');
        }
        setLoading(false);
    };

    return (
        <Modal
            title={`Editar periodo: ${period.period} - ${period.year}`}
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button key="cancel" onClick={onCancel} variant='text' disabled={loading}>Cancelar</Button>,
                <Button key="edit" onClick={handleChangeEndDate} variant='solid' color='primary' disabled={loading || !changed}>Aceptar</Button>
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <p><strong>Periodo:</strong> {period.period}</p>
                <p><strong>Año:</strong> {period.year}</p>
                <p><strong>Fecha de inicio:</strong> {getDate(period.startDate)}</p>
                <div>
                    <strong>Fecha de fin:</strong>
                    <DatePicker
                        format="DD-MM-YYYY"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={handleDateChange}
                        style={{width:'100%'}}
                    />
                </div>
            </div>
        </Modal>
    );
};
//Teachers
export const AddNewTeacher = ({open, onCancel, updateList}) => {
    const { messageApi } = useContext(appContext)
    const [loading, setLoading] = useState(false)
    const [identification, setIdentification] = useState('')
    const [name, setName] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')

    const cleanForm = () => {
        setIdentification('')
        setName('')
        setLastname('')
        setEmail('')
        setPhone('')
        setLoading(false)
        onCancel()
    }

    const submitNewTeacher = async () => {
        if(!identification || !name || !lastname || !email || phone==''){
            messageApi.open({ type: 'error', content: 'Debe ingresar todos los datos' })
            return
        }
        setLoading(true)
        const data = {
            identification: Number(identification),
            name,
            lastname,
            email,
            phone
        }
        const res = await createTeacher(data)
        if(res.status === 200){
            messageApi.open({ type: 'success', content: 'Profesor registrado correctamente' })
            cleanForm()
            updateList()
        }else{
            messageApi.open({ type: 'error', content: 'Error al registrar profesor' })
            setLoading(false)
        }
    }

    return(
        <Modal
            title='Agregar nuevo profesor'
            open={open} 
            closable={false}
            destroyOnClose
            footer={[
                <Button onClick={cleanForm} variant='link' color='danger'>Cancelar</Button>,
                <Button disabled={loading || !identification || !name || !lastname || !email || phone==''} onClick={submitNewTeacher} variant='solid' color='primary'>Agregar</Button>
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Input
                    placeholder='Numero de cedula'
                    value={identification}
                    onChange={e => setIdentification(e.target.value)}
                    type='number'
                />
                <Input
                    placeholder='Nombre'
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <Input
                    placeholder='Apellido'
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                />
                <Input
                    placeholder='Correo electronico'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type='email'
                />
                <InputPhone
                    value={phone}
                    setter={e => setPhone(e)}
                />
            </div>
        </Modal>
    )
}

export const DeactivateTeacherModal = ({open, onCancel, teacherId, updateList}) => {
    const { messageApi } = useContext(appContext)
    const [loading, setLoading] = useState(false)

    const handleDeactivate = async () => {
        setLoading(true)
        const res = await deactivateTeacher(teacherId)
        if(res.status === 200){
            messageApi.open({ type: 'success', content: 'Profesor desactivado correctamente' })
            setLoading(false)
            updateList()
            onCancel()
        }else{
            messageApi.open({ type: 'error', content: 'Error al desactivar profesor' })
            setLoading(false)
        }
    }

    return(
        <Modal
            title='¿Desea desactivar este profesor?'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button onClick={onCancel} variant='text' color='primary' disabled={loading}>Cancelar</Button>,
                <Button onClick={handleDeactivate} variant='solid' color='danger' disabled={loading}>Desactivar</Button>
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <p>Esta acción marcará al profesor como inactivo y no podrá ser asignado a nuevas secciones.</p>
            </div>
        </Modal>
    )
}

export const StudentListOfSectionModal = ({open, onCancel, sectionId}) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)

	const fetchStudents = async () => {
		setLoading(true)
		const res = await getStudentsInSection(sectionId)
		if(res.status === 200){
			setStudents(res.data)
		}else{
			messageApi.open({ type: 'error', content: 'Error al obtener los estudiantes de la sección' })
		}
		setLoading(false)
	}

    useEffect(() => {
        fetchStudents()
    }, [sectionId])

    const listData = students.map(student => ({
        title: `${student.name} ${student.lastname}`,
        description: `Cedula: ${student.studentsIdentification}`,
		date: `${getDate(student.dateEnrollment)}`,
		status: `${student.status}`,
        key: student.id
    }))

    return(
        <Modal
            title='Estudiantes inscritos en la sección'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
				<Button onClick={() => downloadPDF(listData)} variant='solid' color='primary' disabled={loading}>Generar lista</Button>,
                <Button onClick={onCancel} variant='text' color='primary' disabled={loading}>Cerrar</Button>,
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <List
					bordered
					className='mainList'
                    loading={loading}
                    dataSource={listData}
                    renderItem={item => (
                        <List.Item>
                            <Tooltip title={item.title}>
                                <List.Item.Meta
									title={item.title}
									description={
										<span style={{ color: '#474747' }}> {/* Aquí cambias el color general */}
											{item.description} 
											{'\t - \t Fecha de inscripción: ' + item.date}
											<span style={{ 
												color: item.status === 'Pagada' ? '#474747' : 'red',
												fontWeight: 'bold' 
											}}>
												{'\t - \t Estado: ' + item.status}
											</span>
										</span>
										//item.description + '\t - \t Fecha de inscripción: ' + item.date + '\t - \t Estado: ' + item.status
									}
                                />
                            </Tooltip>
                        </List.Item>
                    )}
                />
            </div>
        </Modal>
)}

//Notas
export const LoadGradesModal = ({ open, onCancel }) => {
    const [students, setStudents] = useState([])
    const [grades, setGrades] = useState({})
    const [periods, setPeriods] = useState([])
    const [sections, setSections] = useState([])
    const [selectedSection, setSelectedSection] = useState(null)
    const [evaluationMode, setEvaluationMode] = useState('Simple')
    const { messageApi } = useContext(appContext)

    const [loading, setLoading] = useState(false)

    const getPeriodsActives = async () => {
        setLoading(true)
        const res = await getActivePeriods()
        if (res.status === 200) {
            setPeriods(res.data)
        } else {
            messageApi.open({ type: 'error', content: 'Error al obtener los periodos' })
        }
        setLoading(false)
    }

    const fetchStudents = async (sectionId) => {
        setLoading(true)
        const section = sections.find(s => s.id === sectionId)
        setSelectedSection(section)
        setEvaluationMode(section?.evaluationMode || 'Simple')
        
        const res = await getStudentsInSection(sectionId)
        if (res.status === 200) {
            setStudents(res.data)
        } else {
            messageApi.open({ type: 'error', content: 'Error al obtener los estudiantes de la sección' })
        }
        setLoading(false)
    }

    const getSectionsActives = async (periodId) => {
        setLoading(true)
        const res = await getSectionByPeriod(periodId)
        if (res.status === 200) {
            setSections(res.data)
        } else {
            messageApi.open({ type: 'error', content: 'Error al obtener las secciones' })
        }
        setLoading(false)
    }

    useEffect(() => {
        getPeriodsActives()
    }, [])

    const handleGradeChange = (studentId, evaluationOrder, score) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [evaluationOrder]: score
            }
        }));
    };

    const cleanForm = () => {
        setGrades({})
        setStudents([])
        setSections([])
        setSelectedSection(null)
        onCancel()
    }

    async function loadGrades() {
        setLoading(true)

        const allGraded = students.every(student => {
            const studentGrades = grades[student.id] || {}
            if (evaluationMode === 'Promedio') {
                return studentGrades[1] !== undefined && studentGrades[1] !== "" &&
                        studentGrades[2] !== undefined && studentGrades[2] !== ""
            }
            return studentGrades[1] !== undefined && studentGrades[1] !== ""
        });

        if (!allGraded) {
            messageApi.open({
                type: 'warning',
                content: 'Por favor, asigne todas las notas requeridas antes de continuar.'
            });
            setLoading(false);
            return;
        }

        const data = {
            sectionId: selectedSection.id,
            evaluationMode,
            grades: students.map(student => {
                const studentGrades = grades[student.id] || {}
                if (evaluationMode === 'Promedio') {
                    return {
                        studentId: student.id,
                        enrollmentGradeId: student.enrollmentGradeId,
                        scores: [
                            { evaluationOrder: 1, score: Number(studentGrades[1]) },
                            { evaluationOrder: 2, score: Number(studentGrades[2]) }
                        ]
                    }
                }
                return {
                    studentId: student.id,
                    enrollmentGradeId: student.enrollmentGradeId,
                    score: Number(studentGrades[1])
                }
            })
        }

        const res = await setLoadScores(data)
        if (res.status === 200) {
            messageApi.open({ type: 'success', content: 'Notas cargadas con éxito' });
            cleanForm();
        } else {
            messageApi.open({ type: 'error', content: 'Error al cargar las notas' });
        }
        setLoading(false);
    }

    const renderGradeInputs = (student) => {
        const studentGrades = grades[student.id] || {}

        if (evaluationMode === 'Promedio') {
            return (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#666' }}>1ra</span>
                        <InputGrade
                            value={studentGrades[1] || ""}
                            onChange={(val) => handleGradeChange(student.id, 1, val)}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#666' }}>2da</span>
                        <InputGrade
                            value={studentGrades[2] || ""}
                            onChange={(val) => handleGradeChange(student.id, 2, val)}
                        />
                    </div>
                </div>
            )
        }

        return (
            <InputGrade
                value={studentGrades[1] || ""}
                onChange={(val) => handleGradeChange(student.id, 1, val)}
            />
        )
    }

    const listData = students.map(student => ({
        title: `${student.name} ${student.lastname}`,
        description: `Cédula: ${student.studentsIdentification}`,
        date: `${getDate(student.dateEnrollment)}`,
        status: `${student.status}`,
        key: `${student.id}`,
        renderGrades: renderGradeInputs(student)
    }))

    return (
        <Modal
            title={`Carga de Notas`}
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button onClick={() => loadGrades()} variant='solid' color='primary' disabled={loading || students.length === 0}>Cargar notas</Button>,
                <Button onClick={() => cleanForm()} variant='text' color='primary'>Cerrar</Button>,
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Select
                        onChange={(e) => getSectionsActives(e)}
                        options={
                            periods.map(item => {
                                const month = lists.monthNames[item.period - 1] || item.period;
                                return ({ label: month + ' - ' + item.year + ' - ' + item.modality, value: item.id })
                            })}
                        placeholder='Seleccione un periodo'
                    />
                </div>

                {sections.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Select
                            onChange={(e) => fetchStudents(e)}
                            options={
                                sections.map(item => ({ label: 'Sección ' + item.code, value: item.id }))}
                            placeholder='Seleccione una sección'
                        />
                    </div>
                )}

                {students && students.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <List
                            bordered
                            className='mainList'
                            loading={loading}
                            dataSource={listData}
                            renderItem={item => (
                                <List.Item>
                                    <Tooltip title={item.title}>
                                        <List.Item.Meta
                                            title={item.title}
                                            description={
                                                <span style={{ color: '#474747', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {item.description}
                                                    {item.renderGrades}
                                                </span>
                                            }
                                        />
                                    </Tooltip>
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p>Debe seleccionar una sección para ver a sus estudiantes</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export const ModifyGradesModal = ({ open, onCancel, info }) => {
    const [studentId, setStudentId] = useState('')
    const [moduleSelected, setModuleSelected] = useState('')
    const [moduleList, setModuleList] = useState([])
    const [student, setStudent] = useState(null)
    const [gradeData, setGradeData] = useState(null)
    const [newFinalScore, setNewFinalScore] = useState('')
    const [newPartialScores, setNewPartialScores] = useState({ 1: '', 2: '' })
    const [reason, setReason] = useState('')
    const { messageApi } = useContext(appContext)
    const [loading, setLoading] = useState(false)

    const getModules = async () => {
        const res = await getAllModules()
        if (res.status === 200) {
            setModuleList(res.data)
        }
    }

    useEffect(() => {
        getModules()
    }, [])

    async function searchGrade() {
        setLoading(true)
        const data = {
            studentIdentification: studentId,
            moduleId: moduleSelected
        }
        const res = await getScoreByStudent(data)
        if (res.status === 200 && res.data.length > 0) {
            const data = res.data[0]
            setStudent({
                id: data.id,
                name: data.name,
                lastname: data.lastname,
                studentsIdentification: data.studentsIdentification
            })
            setGradeData({
                gradeId: data.gradeId,
                finalScore: data.finalScore,
                status: data.status,
                evaluationMode: data.evaluationMode,
                partials: [
                    { id: data.partialId1, score: data.partialScore1, weight: data.partialWeight1, order: 1 },
                    { id: data.partialId2, score: data.partialScore2, weight: data.partialWeight2, order: 2 }
                ].filter(p => p.id !== null)
            })
            setNewFinalScore('')
            setNewPartialScores({ 1: '', 2: '' })
        } else if (res.status === 404 || !res.data || res.data.length === 0) {
            messageApi.open({ type: 'error', content: 'Alumno no encontrado o sin notas en este módulo' })
        } else {
            messageApi.open({ type: 'error', content: 'Error al buscar alumno' })
        }
        setLoading(false)
    }

    async function modifyGrades() {
        setLoading(true)

        if (!reason.trim()) {
            messageApi.open({ type: 'warning', content: 'Debe ingresar un motivo para la modificación' })
            setLoading(false)
            return
        }

        let payload = {
            gradeId: gradeData.gradeId,
            evaluationMode: gradeData.evaluationMode,
            reason: reason
        }

        if (gradeData.evaluationMode === 'Simple') {
            if (newFinalScore === '' || newFinalScore === null) {
                messageApi.open({ type: 'warning', content: 'Debe ingresar la nueva nota' })
                setLoading(false)
                return
            }
            payload.finalScore = {
                lastScore: gradeData.finalScore,
                newScore: Number(newFinalScore)
            }
        } else {
            const changedPartials = []
            gradeData.partials.forEach(p => {
                const newVal = newPartialScores[p.order]
                if (newVal !== '' && newVal !== null && Number(newVal) !== p.score) {
                    changedPartials.push({
                        partialId: p.id,
                        evaluationOrder: p.order,
                        lastScore: p.score,
                        newScore: Number(newVal)
                    })
                }
            })

            if (changedPartials.length === 0) {
                messageApi.open({ type: 'warning', content: 'Debe modificar al menos una nota parcial' })
                setLoading(false)
                return
            }
            payload.partials = changedPartials
        }

        const res = await setUpdateScore(payload)

        if (res.status === 200) {
            messageApi.open({ type: 'success', content: 'Nota modificada con éxito' })
            cleanForm()
        } else {
            messageApi.open({ type: 'error', content: 'Error al modificar la nota' })
        }
        setLoading(false)
    }

    async function cleanForm() {
        setLoading(false)
        setStudentId('')
        setModuleSelected('')
        setStudent(null)
        setGradeData(null)
        setNewFinalScore('')
        setNewPartialScores({ 1: '', 2: '' })
        setReason('')
        onCancel()
    }

    const handlePartialChange = (order, value) => {
        setNewPartialScores(prev => ({ ...prev, [order]: value }))
    }

    return (
        <Modal
            title='Modificar Notas'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button onClick={() => modifyGrades()} variant='solid' color='primary' disabled={loading || !student}>Modificar notas</Button>,
                <Button onClick={() => cleanForm()} variant='text' color='primary'>Cerrar</Button>,
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '85%' }}>
                    <Input placeholder='Cédula' onChange={(e) => setStudentId(e.target.value)} value={studentId} />
                    <Select
                        options={moduleList.map(item => ({ label: item.description, value: item.id }))}
                        onChange={(e) => {
                            setModuleSelected(e)
                            setStudent(null)
                            setGradeData(null)
                        }}
                        placeholder='Seleccione el módulo'
                        value={moduleSelected || undefined}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                    <Button onClick={() => searchGrade()} variant='text' color='primary' disabled={!studentId || !moduleSelected}>Buscar</Button>
                </div>
            </div>

            {student && gradeData ? (
                <div>
                    <Divider>Datos Actuales</Divider>
                    <div style={{ marginTop: 20 }}>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Estudiante">{`${student.name} ${student.lastname}`}</Descriptions.Item>
                            <Descriptions.Item label="Modo">{gradeData.evaluationMode}</Descriptions.Item>

                            {gradeData.evaluationMode === 'Simple' ? (
                                <Descriptions.Item label="Nota Actual" span={2}>{gradeData.finalScore ?? 'Sin nota'}</Descriptions.Item>
                            ) : (
                                <>
                                    {gradeData.partials.map(p => (
                                        <Descriptions.Item key={p.order} label={`Nota Parcial ${p.order} (${p.weight}%)`}>
                                            {p.score ?? 'Sin nota'}
                                        </Descriptions.Item>
                                    ))}
                                    <Descriptions.Item label="Nota Final" span={2}>{gradeData.finalScore ?? 'Sin nota'}</Descriptions.Item>
                                </>
                            )}

                            <Descriptions.Item label="Materia" span={2}>
                                {moduleList.find(item => item.id === moduleSelected)?.description}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Editar Información</Divider>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {gradeData.evaluationMode === 'Simple' ? (
                                <div>
                                    Nueva Nota:
                                    <InputGrade
                                        value={newFinalScore}
                                        onChange={(e) => setNewFinalScore(e)}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {gradeData.partials.map(p => (
                                        <div key={p.order} style={{ flex: 1 }}>
                                            Nueva Nota Parcial {p.order}:
                                            <InputGrade
                                                value={newPartialScores[p.order] || ""}
                                                onChange={(val) => handlePartialChange(p.order, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                Motivo:
                                <Input.TextArea
                                    rows={3}
                                    style={{ marginTop: 5 }}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: 10, textAlign: 'center', fontSize: '10px' }}>Debe buscar al estudiante</div>
            )}
        </Modal>
    )
}

export const ViewGradesSectionModal = ({ open, onCancel, period }) => {
    const [sections, setSections] = useState([]);
    const [selectedSectionCode, setSelectedSectionCode] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const month = lists.monthNames[period.period - 1];

	const cleanForm = () => {
		setSections([]);
		setSelectedSectionCode(null);
		setRawData([]);
		onCancel();
	}

    const fetchSections = async () => {
        setLoading(true);
        const res = await getSectionByPeriod(period.id); 
        if (res.status === 200) {
            setSections(res.data);
        }
        setLoading(false);
    };

    const fetchGrades = async (sectionCode) => {
        setLoading(true);
        const res = await getGradeStudentsBySection(period.id, sectionCode);
        console.log(res);
        if (res.status === 200) {
            setRawData(res.data);
        }
        setLoading(false);
    };


    useEffect(() => {
        if (open) fetchSections();
    }, [open, period.id]);

    const { columns, dataSource } = useMemo(() => {
        if (!rawData || rawData.length === 0) return { columns: [], dataSource: [] };

        const moduleSet = new Set();
        rawData.forEach(student => {
            console.log(student);
            student.grades.forEach(g => moduleSet.add(g.module));
        });

        const baseColumns = [
            {
                title: 'Identificación',
                dataIndex: 'identification',
                key: 'identification',
                width: 120,
                fixed: 'left',
            },
            {
                title: 'Estudiante',
                dataIndex: 'fullName',
                key: 'fullName',
                width: 200,
                fixed: 'left',
                sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            },
        ];

        const moduleColumns = Array.from(moduleSet).sort().map(modName => ({
            title: modName,
            dataIndex: modName,
            key: modName,
            align: 'center',
            render: (value) => {
                const { score, status } = value || {};
                const isFail = score !== null && score < 10;
                const isWithdrawn = status === 'Retirado';
                
                return (
                    <span style={{ 
                        fontWeight: isFail || isWithdrawn ? 'bold' : 'normal', 
                        color: isWithdrawn ? '#8c8c8c' : isFail ? '#ff4d4f' : 'inherit',
                        fontStyle: isWithdrawn ? 'italic' : 'normal'
                    }}>
                        {isWithdrawn ? 'Retirado' : (score !== null ? score : '-')}
                    </span>
                );
            }
        }));

        const tableData = rawData.map((student, idx) => {
            const row = {
                key: student.identification || idx,
                identification: student.identification,
                fullName: student.fullName,
            };
            student.grades.forEach(g => {
                row[g.module] = { score: g.finalScore, status: g.status };
            });
            return row;
        });

        return { columns: [...baseColumns, ...moduleColumns], dataSource: tableData };
    }, [rawData]);

    return (
        <Modal
            title={`Notas: ${month} ${period.year} - ${period.modality}`}
            open={open}
            width={1000}
			onCancel={cleanForm}
			closable={false}
			destroyOnClose
            footer={[
                <Button key="print" type='primary' onClick={() => window.print()} disabled={dataSource.length === 0}>
                    Imprimir Reporte
                </Button>,
                <Button key="cancel" onClick={cleanForm}>Cerrar</Button>
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <Divider orientation="left">Seleccionar Sección</Divider>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Seleccione una sección para ver las notas"
                        loading={loading && sections.length === 0}
                        onChange={(value) => {
                            setSelectedSectionCode(value);
                            fetchGrades(value);
                        }}
                        options={sections.map(sec => ({
                            label: `Sección ${sec.code}`,
                            value: sec.code
                        }))}
                    />
                </div>

                {selectedSectionCode ? (
                    <div className="table-container">
                        <Spin spinning={loading}>
                            <Table
                                columns={columns}
                                dataSource={dataSource}
                                scroll={{ x: 'max-content', y: 400 }}
                                bordered
                                size="small"
                                pagination={false}
                                locale={{ emptyText: <Empty description="No hay estudiantes inscritos en esta sección" /> }}
                            />
                        </Spin>
                    </div>
                ) : (
                    <Empty description="Por favor, selecciona una sección para visualizar la sábana de notas." />
                )}
            </div>
        </Modal>
    );
};

export const StudentDocsModal = ({open, onCancel, studentId}) => {
	
	const [loading, setLoading] = useState(false)
	const [showList, setShowList] = useState([])
	const [selectedDocType, setSelectedDocType] = useState()
	const { messageApi } = useContext(appContext)

	useEffect(() => {
		if(studentId !== ""){
			getDocs()
		}
	}, [studentId])

	async function getDocs(){
		if(studentId !== null){
			const res = await getStudentDocuments(studentId)
			if(res.status === 200){
				setShowList(res.data)
			}else{
				messageApi.open({
					type: "error",
					content: "ha ocurrido un error"
				})
			}
		}
	}

	async function downloadDoc(docId){
		const res = await getDocument(docId)
		if(res.status === 200){
			const fileName = `Documento ${docId}.pdf`
			window.api.saveFile(res.data, fileName)
			messageApi.open({
				type: "success",
				content: "Documento guardado con exito"
			})
		}else{
			messageApi.open({
				type: 'error',
				content: "ha ocurrido un error"
			})
		}
	}

	async function submitDoc(){
		setLoading(true)
		const formData = new FormData;
		const docInput = document.getElementById("newDocFileInput").files[0]
		formData.append("file", docInput)
		formData.append("docType", selectedDocType)
		const res = await uploadStudentDocument(formData, studentId)
		if(res.status === 201){
			messageApi.open({
				type: 'success',
				content: 'Documento guardado con exito'
			})
			getDocs()
		}else{
			messageApi.open({
				type: 'error',
				content: 'ha ocurrido un error'
			})
		}
		setLoading(false)
	}

	return(
		<Modal
			open={open}
			onCancel={onCancel}
			title="Documentacion"
			destroyOnHidden
			closable={false}
			footer={[
				<Button onClick={() => onCancel()} disabled={loading}>Cerrar</Button>
			]}
		>
			<div style={{margin: "0px 0px 5px 0px", display: 'flex', alignItems: 'center', gap: '10px'}}>
				<Select 
					defaultValue={"Documento a subir"}
					options={lists.studentDocs}
					onChange={e => setSelectedDocType(e)}
					disabled={loading}
				/>
				<input
					type='file'
					id='newDocFileInput'
					disabled={loading}
					style={{width: '150px'}}
					accept='.pdf'/>
				<Button onClick={() => submitDoc()} disabled={loading}>Subir</Button>
			</div>
			{showList.length === 0 ? (<>
				<h3>No se han guardado documentos para este estudiante</h3>
			</>):(<>
				<List bordered size='small'>
					{showList.map(item => (
						<List.Item>
							<p>{lists.searchOnList(lists.studentDocs, item.docType)}</p>
							<Button
								shape='circle'
								icon={<DownloadOutlined />}
								title='Descargar'
								disabled={loading}
								onClick={() => downloadDoc(item.id)}
							/>
						</List.Item>
					))}
				</List>
			</>)}
		</Modal>
	)
}