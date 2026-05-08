import React, { useEffect, useState, useContext } from 'react'
import { Input, Button, Tooltip, List, Divider, message } from 'antd'
import {EditOutlined, UnlockOutlined ,DeleteOutlined } from '@ant-design/icons'
import { AddNewUserModal as AddNewUser, DeleteUserModal as DeleteUser, ChangePasswordModal as ChangePassword, ChangeUserTypeModal as ChangeUserType } from '../components/Modals'
import { getAllUsers, createUser, updateUser } from '../client/client'
import { searchOnList, userTypeList } from '../context/lists'
import { appContext } from '../context/appContext'
// import Pagination from '../components/Pagination'

const Users = () => {
	const {contextHolder, messageApi} = useContext(appContext)

	//Control de la UI
	const [showList, setShowList] = useState([])
	const [selectedItem, setSelectedItem] = useState()

	//Control de modals
	const [addNewUserModal, setNewUserModal] = useState(false)
	const [deleteUserModal, setDeleteUserModal] = useState(false)
	// const [changePasswordModal, setChangePasswordModal] = useState(false)
	// const [changeTypeModal, setChangeTypeModal] = useState(false)

	//Funciones
	useEffect(() => {
		getContent()
	}, [])

	async function getContent(){
		const res = await getAllUsers()
		console.log(res)
		if(res.status == 200){
			setShowList(res.data)
		}else{
			messageApi.open({
				type: 'error',
				content: 'ha ocurrido un error al cargar los usuarios'
			})
		}
	}

	return(
		<div className='ConsultarRegistros Page'>
			<Divider className='PageTitle'><h1>Administracion de usuarios</h1></Divider>
			{contextHolder}
			<div className='listContainer Content' >
				<Button onClick={() => setNewUserModal(true)}>Nuevo usuario</Button>
				<List bordered className='mainList' size='small'>
					{ showList.map(item => (
						<List.Item className='listItem' key={item.id}>
							<div className='info'>
								<h3>{item.id} {item.name} {item.lastname} - {searchOnList(userTypeList, item.type)} </h3>
							</div>
							<div className='buttons'>
								{/* <Tooltip onClick={() => {setSelectedItem(item); setChangePasswordModal(true)}} title='Cambiar contraseña'><Button shape='circle' variant='solid' color='primary' size='large' icon={<UnlockOutlined />} /></Tooltip> */}
								{/* <Tooltip onClick={() => {setSelectedItem(item); setChangeTypeModal(true)}} title='Cambiar tipo'><Button shape='circle' variant='solid' color='primary' size='large' icon={<EditOutlined />} /></Tooltip> */}
								<Tooltip title='Eliminar'>
									<Button
										shape='circle'
										variant='solid'
										color='danger'
										size='large'
										icon={<DeleteOutlined/>}
										onClick={() => {setSelectedItem(item); setDeleteUserModal(true)}}/>
								</Tooltip>
							</div>
						</List.Item>
					)) }
					{/* <Pagination page={page} setPage={setPage}/> */}
				</List>
			</div>

            <div className='EmptyFooter'/>


			<AddNewUser
				open={addNewUserModal}
				onCancel={() => setNewUserModal(false)}
				updateList={() => getContent()}
			/>

			<DeleteUser
				open={deleteUserModal}
				onCancel={() => setDeleteUserModal(false)}
				updateList={() => getContent()}
				user={selectedItem}
			/>

			{/* <ChangePassword 
				open={changePasswordModal}
				onCancel={() => setChangePasswordModal(false)}
				info={selectedItem}
			/> */}

			{/* <ChangeUserType
				open={changeTypeModal}
				onCancel={() => setChangeTypeModal(false)}
				info={selectedItem}
			/> */}
		</div>
	)
}

export default Users