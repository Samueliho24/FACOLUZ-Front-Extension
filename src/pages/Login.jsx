import { Form, Input, Button, InputNumber } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { appContext } from '../context/appContext' 
import { encrypt } from '../functions/hash'
import { login } from '../client/client'
import { LoadingOutlined } from '@ant-design/icons'
import React from 'react'
import { routerContext } from '../context/routerContext'
import logofaco from '../assets/Logo_FacoLuz.png'
import logoluz from '../assets/Logo_LUZ.png'

const Login = () => {

	const [loading, setLoading] = useState(false)
	const {setView} = useContext(routerContext)
	const { messageApi, setUserData, setLogged, contextHolder } = useContext(appContext)

	useEffect(() => {
		setLogged(false)
	}, [])

	const submitLogin = async () => {
		setLoading(true)
		const identification = document.getElementById('identification').value
		const password = document.getElementById('password').value

		const data = {
			id: identification,
			passwordHash: await encrypt(password)
		}
		let res = await login(data)
		if(res.status == 200){
			setView("Home")
			setUserData(res.data)
			setLogged(true)
		}else{
			messageApi.open({
				type: 'error',
				content: res.response.data
			})
			setLoading(false)
		}
	}

	return(
		<div className='Login'>
			{contextHolder}
			<Form disabled={loading} className='loginForm' onFinish={submitLogin}>
				<div className='logos'>
					<img src={logoluz} className='logoluz'/>
					<img src={logofaco} className='logofaco'/>
				</div>
				<h1>Modulo administrativo</h1>
				<h2>Iniciar sesion</h2>
				<Form.Item name='identification'>
					<Input placeholder='Identificacion' disabled={loading} />
				</Form.Item>
				<Form.Item name='password'>
					<Input.Password placeholder='Contraseña'disabled={loading} />
				</Form.Item>

				<Button htmlType='submit' disabled={loading} color='default' > {loading ? (<>{<LoadingOutlined />}Cargando...</>):(<h4>Iniciar sesion</h4>)} </Button>
			</Form>
		</div>
	)
}

export default Login