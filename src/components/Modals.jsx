import { openSection, closeSection } from '../client/client'
import { Modal, Button, Input, InputNumber, Select, Form, Space, message, List, DatePicker } from 'antd'
import { useState, useEffect, useContext, act } from 'react'
import { appContext } from '../context/appContext'
import * as lists from '../context/lists'
import { encrypt } from '../functions/hash'
import { verifyInvoice, deleteUser, createStudent, changePassword, changeUserType ,openPeriod, closePeriod, changeEndDatePeriod, getIdUsers, createNewModule, getAllModules, getAssignedModules, updateAssignedModules, getPaymentsForInvoice, makePayment, getDolarPrice, updatePhoto,createTeacher, deactivateTeacher, deactivateStudent } from '../client/client'
import React from 'react'
import { routerContext } from '../context/routerContext'
import { getDate, getTime } from '../functions/formatDateTime'
import InputPhone from "../components/InputPhone"
import TextArea from 'antd/es/input/TextArea'
import { mergeDate } from '../functions/formatDateTime'
import dayjs from 'dayjs';

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
		const picInput = document.getElementById(picInput).files[0]
		const formData = new FormData
		formData.append("picture", picInput)
		formData.append("studentId", studentId)
		const res = await updatePhoto(formData)
		if(res.status == 201){
			messageApi({
				type: "success",
				content: "Foto actualizada con exito"
			})
			onCancel()
		}else{
			messageApi.open({
				type: "success",
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
			title="Actualizar foto"
		>
			<input type='file' id="picInput"/>
		</Modal>
	)
}

export const OpenPeriodModal = ({open, period, onCancel, refreshPeriods}) => {

	const [loading, setLoading] = useState(false)
	const [year, setYear] = useState('')
	const [periodId, setPeriodId] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const {messageApi} = useContext(appContext)

	// Recibe el callback para actualizar la lista
	
	const submitChangeType = async () => {
		setLoading(true)
		const data = {
			year: year,
			period: periodId,
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
			refreshPeriods()    
		}else{
			messageApi.open({
				type: 'error',
				content: res.response.data
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

export const OpenSectionModal = ({open, section, onCancel, refreshSections}) => {
    const { messageApi, currentPeriodSection, moduleList, teacherList } = useContext(appContext)
    const [loading, setLoading] = useState(false)
    const [periodId, setPeriodId] = useState('')
    const [moduleId, setModuleId] = useState('')
    const [teacherId, setTeacherId] = useState('')
    const [code, setCode] = useState('')
    const [modality, setModality] = useState('')
    const [quota, setQuota] = useState('')

	useEffect(() => {
        if (currentPeriodSection) {
            setPeriodId(currentPeriodSection.id || currentPeriodSection.periodId || '')
        }
        if (!open) {
            // Limpiar campos al cerrar el modal
            setModuleId('');
            setTeacherId('');
            setCode('');
            setModality('');
            setQuota('');
        }
    }, [currentPeriodSection, open])

    const handleAddSection = async () => {
		const data = {
			periodId,
			moduleId,
			teacherId,
			code,
			modality,
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

    return (
        <Modal
            title='Agregar nueva sección'
            open={open}
            closable={false}
            destroyOnClose
            footer={[
                <Button key="cancel" onClick={onCancel} variant='text' disabled={loading}>Cancelar</Button>,
                <Button key="add" onClick={handleAddSection} variant='solid' color='primary' disabled={loading || !periodId || !moduleId || !teacherId || !code || !modality || !quota}>Agregar</Button>
            ]}
        >
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Select
                    placeholder='Módulo'
                    value={moduleId ? moduleId : undefined}
                    onChange={setModuleId}
                    options={moduleList.map(m => ({ value: m.id, label: m.description }))}
                />
                <Select
                    placeholder='Docente'
                    value={teacherId ? teacherId : undefined}
                    onChange={setTeacherId}
                    options={teacherList.map(t => ({ value: t.id, label: `${t.name} ${t.lastName}` }))}
                />
                <Input placeholder='Código de sección' value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={1} />
                <Select
                    placeholder='Modalidad'
                    value={modality ? modality : undefined}
                    onChange={setModality}
                    options={[{value:'Intensivo',label:'Intensivo'},{value:'Sabatino',label:'Sabatino'}]}
                />
                <InputNumber placeholder='Cupo' value={quota} onChange={setQuota} min={1} style={{width:'100%'}} />
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
			title={`¿Desea cerrar la sección ${section ? section.name : ''}?`}
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
	
	const [showList, setShowList] = useState([])
	const [remainingDebt, setRemainingDebt] = useState(0)

	async function getInfo(){
		const res = await getPaymentsForInvoice(Invoice.id)
		console.log(res)
		if(res.status == 200){
			setShowList(res.data)
		}
		setRemainingDebt(0)
		let paid = 0
		res.data.forEach((item) => {
			paid += item.paidAmount
			let remaining = Invoice.chargedAmount - paid
			setRemainingDebt(remaining)
		});
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
			<h4>Restante: ${remainingDebt.toFixed(2)}</h4>
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
        if(!identification || !name || !lastname || !email || !phone){
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
                <Button disabled={loading || !identification || !name || !lastname || !email || !phone} onClick={submitNewTeacher} variant='solid' color='primary'>Agregar</Button>
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
                <Input
                    placeholder='Telefono'
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
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