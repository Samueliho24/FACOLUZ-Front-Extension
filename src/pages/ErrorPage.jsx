import { WarningOutlined } from '@ant-design/icons'
import React, {useContext} from 'react'
import { routerContext } from '../context/routerContext'

const ErrorPage = () => {

	const {setView} = useContext(routerContext)

	return(
		<div className='ErrorPage'>
			<WarningOutlined style={{fontSize: '200px'}} />
			<h1>Ah ocurrido un error</h1>
			<h3 onClick={() => setView('Login')} >Haga click aqui para volver</h3>
		</div>
	)
}

export default ErrorPage