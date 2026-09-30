import { openSection, closeSection, getDocument, uploadStudentDocument, getStudentDocuments, getSectionByPeriod, cancelInvoice, issueInvoice } from '../client/client'
import { Modal, Button, Input, InputNumber, Select, Form, Space, message, List, DatePicker, Tooltip, Divider, Descriptions, Table, Spin, Empty, Alert } from 'antd'
import { useState, useEffect, useContext, useMemo, act } from 'react'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import { encrypt } from '../functions/hash'
import { verifyInvoice, deleteUser, createStudent, changePassword, changeUserType ,openPeriod, closePeriod, changeEndDatePeriod, getIdUsers, createNewModule, getAllModules, getAssignedModules, updateAssignedModules, makePayment, getInvoiceDetail, getDolarPrice, updatePhoto,createTeacher, deactivateTeacher, deactivateStudent, getStudentsInSection, getActivePeriods, setLoadScores, getScoreByStudent,setUpdateScore, getGradeStudentsBySection} from '../client/client'
import React from 'react'
import { routerContext } from '../context/routerContext'
import { getDate, getTime } from '../functions/formatDateTime'
import InputPhone from "../components/InputPhone"
import InputGrade from './InputGrade'
import TextArea from 'antd/es/input/TextArea'
import { mergeDate } from '../functions/formatDateTime'
import dayjs from 'dayjs';
import { ConsoleSqlOutlined, DownloadOutlined } from "@ant-design/icons"
import { isBs, isBsMethod, isExoneration } from "../functions/determinarMoneda"
import { autoCapitalize } from '../functions/autoCapitalize'
import { validateForm, dayjsToISODate, problemFromServer } from '../functions/validateForm'

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

// `VerifyInvoiceModal` se elimino en T9. Leamos por que estaba muerto antes de
// borrarlo, porque es el patron que se repite ahi y conviene no volver a
// escribirlo:
//
//   - Leia `invoice.patientName`, `patientId`, `billableitem`, `amount` y
//     `currency`. Ninguno existe en la consulta real de `invoices`: la tabla
//     tiene `StudentIdentification`, `chargedAmount`, `exchangeRate` y
//     `comments`. Se copio de un sistema de odontologia.
//   - Llamaba a `POST /api/verifyInvoice`, que esta comentado en el back.
//   - La vista que lo usaba no le pasaba el `updateList` que el modal invoca al
//     confirmar, asi que Confirmar habria lanzado `TypeError`.
//   - El boton del LatPanel que abria esa vista ya estaba comentado: no habia
//     forma de llegar.
//
// No es un bug que se pueda arreglar sin decidir de nuevo el flujo: el
// concepto de "factura por verificar" (recibida / rechazada) no existe en el
// modelo actual, donde la factura nace `Pendiente` y se mueve por `status`.

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

	function setStudentName(rawName){
		const formatedName = autoCapitalize(rawName)
		setName(formatedName)
	}

	function setStudentsLastname(rawLastName){
		const formatedLastName = autoCapitalize(rawLastName)
		setLastname(formatedLastName)
	}

	const submitNewStudent = async () => {
		// El chequeo de "todos los datos" de abajo solo miraba que el campo no
		// estuviera vacio: una cedula de 2 digitos, un correo sin arroba o un
		// telefono de 3 digitos pasaban y el servidor los rechazaba al final.
		// Aqui se usan las mismas reglas que en el backend.
		console.log(idNumber, name, lastname, birthDate, email, phone, address, instructionGrade)
		const problema = validateForm({
			identification: (v) => v.identification('identification', idNumber, 'La cedula'),
			name: (v) => v.text('name', name, 'El nombre', { max: 20 }),
			lastname: (v) => v.text('lastname', lastname, 'El apellido', { max: 20 }),
			email: (v) => v.email('email', email),
			phone: (v) => (v) => v.text('phone', phone, 'El teléfono', { min: 6, max: 11 }),
			address: (v) => v.text('address', address, 'La direccion', { max: 100 }),
			instructionGrade: (v) => v.enum('instructionGrade', instructionGrade, 'El nivel de instruccion', [1, 2, 3, 4]),
			birthDate: (v) => v.date('birthDate', dayjsToISODate(birthDate), 'La fecha de nacimiento', { noFutura: true }),
		})

		if (problema) {
			messageApi.open({
				type: 'error',
				content: problema
			})
		} else {
			setLoading(true)
			const data = {
				identification: idNumber,
				name: name,
				lastName: lastname,
				birthDate: dayjsToISODate(birthDate),
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
					content: problemFromServer(res, 'No se pudo registrar el estudiante')
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
					<Input className='testplaceholder' value={name} disabled={loading} onChange={(e) => setStudentName(e.target.value)} placeholder='Nombre' style={{width: '50%'}}/>
					<Input value={lastname} disabled={loading} onChange={(e) => setStudentsLastname(e.target.value)} placeholder='Apellido' style={{width: '50%'}}/>
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
				<Select disabled={loading} onChange={(e) => setUserType(e)} placeholder='Tipo de Usuario' options={lists.userTypeList.slice(1, 6)}/>
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
	
	const {messageApi, dolarPrice} = useContext(appContext)
	const [detalle, setDetalle] = useState(null)
	const [cargando, setCargando] = useState(false)

	useEffect(() => {
		if (Invoice === null || Invoice === undefined) {
			setDetalle(null)
			return
		}
		let vigente = true
		setCargando(true)
		// Un solo pedido: el detalle trae la factura, los pagos Y el saldo. Antes
		// eran dos y el saldo se armaba en el cliente sumando `paidAmount`, lo que
		// ignoraba las devoluciones (`returnedAmount`) y contaba la exoneracion
		// como dinero. La caja veia un restante que el servidor no compartia.
		getInvoiceDetail(Invoice.id).then(res => {
			if (!vigente) return
			setCargando(false)
			if (res.status === 200) {
				setDetalle(res.data)
			}else{
				setDetalle(null)
				messageApi.open({
					type: 'error',
					content: problemFromServer(res, 'No se pudo cargar el historial de la factura'),
					duration: 5
				})
			}
		})
		return () => { vigente = false }
	}, [Invoice])

	// Con tasa 0 la conversion a Bs rompe: se muestra solo el USD.
	const tasa = Number(dolarPrice) > 0 ? Number(dolarPrice) : null
	const saldo = Number(detalle?.balance ?? 0)
	const total = Number(detalle?.chargedAmount ?? 0)
	const showList = detalle?.payments ?? []

	return(
		<Modal
			open={open}
			closable={false}
			destroyOnHidden
			title="Historial de pagos"
			footer={[
				<Button onClick={() => onCancel()}>Cerrar</Button>
			]}
		>
			{cargando && <Spin size="small" />}

			{detalle !== null && (
				<>
					<h4>
						{tasa !== null
							? `Total de la factura: Bs. ${(total * tasa).toFixed(2)} ($${total.toFixed(2)})`
							: `Total de la factura: $${total.toFixed(2)}`
						}
					</h4>
					<h4>
						{tasa !== null
							? `Restante: Bs. ${(saldo * tasa).toFixed(2)} ($${saldo.toFixed(2)})`
							: `Restante: $${saldo.toFixed(2)}`
						}
					</h4>
					{detalle.status !== 'Pendiente' && (
						<Alert
							type={detalle.status === 'Anulada' ? 'error' : 'success'}
							showIcon
							style={{margin: '8px 0'}}
							message={`Estado de la factura: ${detalle.status}`}
						/>
					)}
					{detalle.comments !== null && detalle.comments !== undefined && (
						<h5>Comentarios: {detalle.comments}</h5>
					)}
				</>
			)}

			{showList.length > 0 ?(
				<List bordered>
					{showList.map((item) => (
						<List.Item key={item.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'start'}}>
							{isExoneration(item.receivedPaymentMethod) ? (<>
								{/* Una exoneracion no es dinero: se muestra como tal, no como un
								    pago de $0.00 que confunde el arqueo de caja. */}
								<p style={{margin: "0px", fontWeight: 'bold'}}>
									{`${mergeDate(item.date)} - EXONERADA`}
								</p>
								{item.comments != null && (
									<p style={{margin: "0px", color: '#cf1322'}}>
										{`Observacion: ${item.comments}`}
									</p>
								)}
							</>):(
								<>
									<p style={{margin: "0px"}}>
										{`${mergeDate(item.date)} - Pagado: $${Number(item.paidAmount).toFixed(2)} - ${item.receivedPaymentMethod}`}
									</p>
									{isBs(item.receivedPaymentMethod) && Number(item.exchangeRate) > 0 && (
										<p style={{margin: "0px"}}>
											{`Tasa del pago: ${Number(item.exchangeRate).toFixed(2)} Bs/$ (Bs. ${(Number(item.paidAmount) * Number(item.exchangeRate)).toFixed(2)})`}
										</p>
									)}
									{item.reference != null && <p style={{margin: "0px"}}>Referencia: {item.reference}</p>}
								</>
							)}
							{/* El cambio se muestra con la moneda del metodo de DEVOLUCION, no con
							    el del pago: se puede pagar en Bs y devolver en USD, y antes
							    dividia el cambio por la tasa cuando no tocaba. */}
							{item.returnedAmount > 0 && (<p style={{margin: "0px"}}>
								Cambio: {isBsMethod(item.returnedPaymentMethod)
									? `Bs. ${Number(item.returnedAmount * item.exchangeRate).toFixed(2)}`
									: `$${Number(item.returnedAmount).toFixed(2)}`}
							</p>)}
							{!isExoneration(item.receivedPaymentMethod) && item.comments != null && (
								<p style={{margin: "0px"}}>Observaciones: {item.comments}</p>
							)}
						</List.Item>
					))}
				</List>
			):(
				!cargando && <h3>No hay pagos para mostrar</h3>
			)}
			
		</Modal>
	)
}

export const MakePayment = ({open, onCancel, Invoice, updateList}) => {

	const {messageApi, dolarPrice} = useContext(appContext)

	// Estado de React, no `getElementById`. El modal anterior leia el DOM al
	// enviar, y por un descuido (`returnedAmount` sin definir) reventaba con
	// ReferenceError en CADA pago: no se podia cobrar nada.
	const [paymentMethod, setPaymentMethod] = useState(1)
	const [changeMethod, setChangeMethod] = useState(1)
	const [amount, setAmount] = useState(null)
	const [change, setChange] = useState(null)
	const [reference, setReference] = useState('')
	const [returnReference, setReturnReference] = useState('')
	const [comments, setComments] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// El saldo lo pide al servidor. Antes se sumaba `paidAmount` a mano aqui, lo
	// que ignoraba las devoluciones y contaba la exoneracion como dinero: la caja
	// veia un saldo y el backend rechazaba el pago.
	const [detalle, setDetalle] = useState(null)
	const [cargandoDetalle, setCargandoDetalle] = useState(false)

	const isExoneracion = isExoneration(paymentMethod)
	const paymentSuffix = isBsMethod(paymentMethod) ? 'Bs' : '$'
	const changeSuffix = isBsMethod(changeMethod) ? 'Bs' : '$'

	useEffect(() => {
		if (!open) return
		// Se reinicia al abrir: si se cierra y se vuelve a abrir para otra
		// factura, el monto anterior queda pegado.
		setPaymentMethod(1)
		setChangeMethod(1)
		setAmount(null)
		setChange(null)
		setReference('')
		setReturnReference('')
		setComments('')
		setSubmitting(false)
		setDetalle(null)
	}, [open, Invoice])

	useEffect(() => {
		if (!open || !Invoice) return
		let vigente = true
		setCargandoDetalle(true)
		getInvoiceDetail(Invoice.id).then(res => {
			if (!vigente) return
			if (res.status === 200) setDetalle(res.data)
			setCargandoDetalle(false)
		})
		return () => { vigente = false }
	}, [open, Invoice])

	/**
	 * Convierte a USD, que es la moneda de la factura y la de `payments`.
	 *
	 * Todo monto viaja a la API en USD. Antes el monto se converitia segun el
	 * SUFIJO del campo, y el cambio (devolucion) se mandaba sin convertir: el
	 * backend comparaba Bs contra un saldo en USD y lo rechazaba casi siempre.
	 *
	 * Si la tasa es 0 no se divide: `Infinity` o `NaN` contra un `float NOT NULL`
	 * es un 500. Por eso `rate <= 0` bloquea el cobro con un mensaje.
	 */
	const toUsd = (value, enBolivares) => {
		const n = Number(value)
		if (!Number.isFinite(n) || n <= 0) return 0
		return Math.round((enBolivares ? n / dolarPrice : n) * 100) / 100
	}

	const saldo = Number(detalle?.balance ?? 0)
	const sinTasa = Number(dolarPrice) <= 0
	const saldoCobrable = isExoneracion ? 0 : saldo

	async function submit(){
		if (submitting) return
		if (sinTasa && !isExoneracion) {
			messageApi.open({
				type: 'error',
				content: 'No hay tasa de cambio disponible. No se puede cobrar en bolivares.'
			})
			return
		}
		if (isExoneracion && comments.trim().length < 10) {
			messageApi.open({
				type: 'error',
				content: 'La exoneracion requiere una observacion con el motivo y quien la autorizo'
			})
			return
		}
		if (!isExoneracion && !(toUsd(amount, isBsMethod(paymentMethod)) > 0)) {
			messageApi.open({ type: 'error', content: 'El monto a abonar debe ser mayor a 0' })
			return
		}

		setSubmitting(true)

		const paidAmount = isExoneracion ? 0 : toUsd(amount, isBsMethod(paymentMethod))
		// El cambio tambien va en USD: es un reintegro, no un ingreso.
		const returnedAmount = isExoneracion ? 0 : toUsd(change, isBsMethod(changeMethod))

		const data = {
			InvoiceId: Invoice.id,
			paidAmount: paidAmount,
			receivedPaymentMethod: paymentMethod,
			returnedAmount: returnedAmount,
			// El metodo de devolucion solo viaja si hay devolucion: la columna es
			// nullable y mandarlo siempre mete ruido en el historial.
			returnedPaymentMethod: returnedAmount > 0 ? changeMethod : null,
			reference: (paymentMethod === 2 && reference.trim() !== '') ? reference.trim() : null,
			returnReference: (returnedAmount > 0 && changeMethod === 2 && returnReference.trim() !== '')
				? returnReference.trim()
				: null,
			comments: comments.trim() !== '' ? comments.trim() : null,
			exchangeRate: Number(dolarPrice)
		}

		const res = await makePayment(data)
		setSubmitting(false)

		if (res.status === 200) {
			// El backend responde 200 con el resultado. Antes se diferenciaba por
			// 201 (pago parcial) vs 200 (pago total), una distincion que el
			// servidor ya no hace y que se decidia con el codigo HTTP.
			const r = res.data || {}
			if (r.exonerated) {
				messageApi.open({
					type: 'success',
					content: 'Factura exonerada. No se registro ingreso de dinero.'
				})
			}else if (r.fullyPaid) {
				messageApi.open({ type: 'success', content: 'Pago realizado. Factura saldada.' })
			}else{
				messageApi.open({
					type: 'success',
					content: `Pago registrado. Quedan $${Number(r.balance ?? 0).toFixed(2)} por cobrar.`
				})
			}
			updateList(r.fullyPaid || r.exonerated ? 'Pagado' : 'Pendiente')
			onCancel()
		}else{
			// El modal NO se cierra: si no, el cajero pierde lo que habia escrito y
			// tiene que empezar de nuevo. Ademas se muestra el mensaje real del
			// servidor ("el monto no puede superar el saldo"), no un texto generico.
			messageApi.open({
				type: 'error',
				content: problemFromServer(res, 'Ocurrio un error al registrar el pago'),
				duration: 6
			})
		}
	}

	return (
		<Modal
			open={open}
			onCancel={() => onCancel()}
			destroyOnHidden
			title="Realizar pago"
			onOk={() => submit()}
			confirmLoading={submitting}
			okText={isExoneracion ? 'Exonerar' : 'Registrar pago'}
		>
			<div style={{width: "100%"}}>
				{detalle !== null && (
					<>
						<p style={{margin: '0 0 2px 0'}}>
							{`${detalle.billableName} - ${detalle.name} ${detalle.lastname}`}
						</p>
						<p style={{margin: '0 0 2px 0'}}>
							{`Total: $${Number(detalle.chargedAmount).toFixed(2)} | Cobrado: $${Number(detalle.totalPaid).toFixed(2)}`}
						</p>
						{!isExoneracion && (
							<p style={{margin: '0 0 10px 0'}}>
								{`Saldo pendiente: $${saldo.toFixed(2)}`}
							</p>
						)}
					</>
				)}
				{cargandoDetalle && <Spin size="small" style={{marginBottom: '10px'}} />}

				<div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
					<p style={{width: '50%', margin: '0'}}>Metodo de pago:</p>
					<p style={{width: '50%', margin: '0'}}>Monto a abonar:</p>
				</div>
				<Space.Compact style={{width: "100%"}}>
					<Select
						style={{width: "50%"}}
						options={lists.paymentMethods}
						value={paymentMethod}
						onChange={e => setPaymentMethod(e)}
					/>
					<InputNumber
						style={{width: "50%"}}
						placeholder='monto:'
						suffix={paymentSuffix}
						value={amount}
						onChange={e => setAmount(e)}
						disabled={isExoneracion}
						min={0}
						precision={2}
					/>
				</Space.Compact>

				{isExoneracion && (
					<>
						<Alert
							type='info'
							showIcon
							style={{margin: '10px 0'}}
							message='La exoneracion no es un pago'
							description='No entra dinero: la factura se cierra sin Movimiento de caja. La observacion es obligatoria y tiene que decir por que se exonera y quien lo autorizo.'
						/>
						<TextArea
							placeholder='Observacion (obligatoria). Ej: Exonerado por decreto 1234, autorizado por Dr. Perez'
							value={comments}
							onChange={e => setComments(e.target.value)}
							rows={3}
						/>
					</>
				)}

				{!isExoneracion && (
					<>
						<Input
							style={{margin: '10px 0 10px 0'}}
							placeholder='Referencia:'
							value={reference}
							onChange={e => setReference(e.target.value)}
							disabled={paymentMethod !== 2}
						/>
						<div style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
							<p style={{width: '50%', margin: '0'}}>Metodo de cambio:</p>
							<p style={{width: '50%', margin: '0'}}>Monto regresado:</p>
						</div>
						<Space.Compact  style={{width: "100%"}}>
							<Select
								style={{width: "50%"}}
								options={lists.paymentMethods.filter(m => m.value !== 4)}
								value={changeMethod}
								onChange={e => setChangeMethod(e)}
							/>
							<InputNumber
								style={{width: "50%"}}
								placeholder='cambio'
								suffix={changeSuffix}
								value={change}
								onChange={e => setChange(e)}
								min={0}
								precision={2}
							/>
						</Space.Compact>
						<Input
							style={{margin: '10px 0 10px 0'}}
							placeholder='Referencia de cambio:'
							value={returnReference}
							onChange={e => setReturnReference(e.target.value)}
							disabled={changeMethod !== 2}
						/>
						<TextArea
							placeholder='Observaciones:'
							value={comments}
							onChange={e => setComments(e.target.value)}
						/>
					</>
				)}
			</div>
		</Modal>
	)
}

export const CancelInvoice = ({open, onCancel, Invoice, updateList}) => {

	const { messageApi } = useContext(appContext)

	const [loading, setLoading] = useState(false)
	const [reason, setReason] = useState('')
	// Cuanto hay que devolver. Se pide al servidor antes de confirmar: anular
	// devuelve dinero, y el cajero tiene que saber cuanto efectivo entregar
	// ANTES de apretar el boton, no despues.
	const [detalle, setDetalle] = useState(null)
	const [cargandoDetalle, setCargandoDetalle] = useState(false)

	useEffect(() => {
		if (!open) return
		setReason('')
		setDetalle(null)
	}, [open, Invoice])

	useEffect(() => {
		if (!open || !Invoice) return
		let vigente = true
		setCargandoDetalle(true)
		getInvoiceDetail(Invoice.id).then(res => {
			if (!vigente) return
			setCargandoDetalle(false)
			if (res.status === 200) setDetalle(res.data)
		})
		return () => { vigente = false }
	}, [open, Invoice])

	// El servidor exige 10 caracteres (T7). Se avisa antes de gastar un viaje.
	const reasonValido = reason.trim().length >= 10

	async function submit(){
		if (loading) return
		if (!reasonValido){
			messageApi.open({
				type: 'error',
				content: 'Escriba el motivo de la anulacion (minimo 10 caracteres)'
			})
			return
		}
		setLoading(true)
		const res = await cancelInvoice(Invoice.id, reason.trim())
		if(res.status === 200){
			const r = res.data || {}
			updateList('Anulada')
			messageApi.open({
				type: "success",
				content: r.refunded > 0
					? `Factura anulada. Devuelva $${Number(r.refunded).toFixed(2)} al estudiante`
					: "Factura anulada. No habia nada cobrado que devolver"
			})
			onCancel()
		}else{
			// El modal sigue abierto: anular es irreversible y un error de red no
			// puede hacerte apretar "Anular" otra vez a ciegas.
			messageApi.open({
				type: 'error',
				content: problemFromServer(res, "ha ocurrido un error al anular la factura"),
				duration: 6
			})
		}
		setLoading(false)
	}

	const aDevolver = Number(detalle?.balance ?? 0)

	return(
		<Modal
			title="Anular factura"
			open={open}
			closable={false}
			destroyOnHidden
			footer={[
				<Button disabled={loading} onClick={onCancel}>Cancelar</Button>,
				<Button danger disabled={loading || !reasonValido} loading={loading} onClick={() => submit()}>Anular</Button>
			]}
		>
			<Alert
				type='warning'
				showIcon
				style={{marginBottom: '12px'}}
				message='La anulacion no se puede deshacer'
				description={
					detalle !== null && aDevolver > 0
						? `Esta factura tiene $${aDevolver.toFixed(2)} cobrados. Al anularla se registra una devolucion por ese monto y hay que entregarlo al estudiante.`
						: 'Esta factura no tiene cobros registrados, asi que no se devuelve nada.'
				}
			/>

			{cargandoDetalle && <Spin size="small" style={{marginBottom: '10px'}} />}

			<TextArea
				placeholder='Motivo de la anulacion (obligatorio). Ej: se emitió por error, el alumno ya estaba inscrito'
				value={reason}
				onChange={e => setReason(e.target.value)}
				rows={3}
				status={reason.trim().length > 0 && !reasonValido ? 'error' : undefined}
			/>
			{reason.trim().length > 0 && !reasonValido && (
				<p style={{color: '#cf1322', margin: '4px 0 0 0'}}>
					Faltan {10 - reason.trim().length} caracteres
				</p>
			)}
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
        const problema = validateForm({
            identification: (v) => v.identification('identification', identification, 'La cedula'),
            name: (v) => v.text('name', name, 'El nombre', { max: 20 }),
            lastname: (v) => v.text('lastname', lastname, 'El apellido', { max: 20 }),
            email: (v) => v.email('email', email),
            phone: (v) => v.text('phone', phone, 'El telefono', 6, 11),
        })

        if (problema) {
            messageApi.open({ type: 'error', content: problema })
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
            // Se muestra el mensaje del servidor, no un texto generico: la
            // cedula o el correo ya repetidos llegan aqui como 400.
            messageApi.open({ type: 'error', content: problemFromServer(res, 'Error al registrar profesor') })
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

export const NewInvoiceModal = ({open, onCancel, updateList}) => {

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
		if(studentIdentification === 0 || chargedAmount === 0){
			messageApi.open({
				type: 'error',
				content: 'Complete los datos de forma correcta'
			})
		}else{
			let billable = prices.find(x => x.name === selectedBillable)
			console.log(billable)
			const data = {
				studentIdentification: studentIdentification,
				billableid: billable.id,
				quantity: quantity,
				chargedAmount: billable.price * quantity,
				exchangeRate: dolarPrice,
				comment: comment
			}
			const res = await issueInvoice(data)

			if(res.status == 200){
				messageApi.open({
					type: 'success',
					content: 'Factura creada con exito'
				})
				resetForm()
				updateList()
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
		let bsPrice = 0
		if(selectedBillable !== "Servicio a cancelar:" && quantity >= 1){
			let unitPrice = prices.find(x => x.name === selectedBillable).price;
			let packPrice = unitPrice * quantity;
			bsPrice = packPrice * dolarPrice;
		}
		setChargedAmount(bsPrice.toFixed(2))
	}

	return(
		<Modal 
			className='EmitirFactura'
			title="Emitir Factura"
			open={open}
			closable={false}
			footer={[
				<Button color='blue' onClick={submitIssueInvoice} type='primary'>Emitir Factura</Button>,
				<Button color='red' onClick={onCancel}>Cerrar</Button>
			]}
		>
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
						suffix={` ($${(chargedAmount / dolarPrice).toFixed(2)})`}
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
				
				{/* <Button onClick={submitIssueInvoice}>Emitir factura</Button> */}
			</div>	
		</Modal>
	)
}
