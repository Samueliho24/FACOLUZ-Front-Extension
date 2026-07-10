import React, { useEffect, useContext, useState } from 'react'
import { getBillables } from '../client/client'
import { appContext } from '../context/appContext'
const Home = () => {
	const {setPrices, messageApi, ContextHolder} = useContext(appContext)

	useEffect(() => {
		fetchPrices()
	}, [])

	const fetchPrices = async () => {
		const res = await getBillables()
		if(res.status === 200){
			setPrices(res.data)
		}else{
			messageApi.open({
				type: 'error',
				content: "ha ocurrido un error en los precios de servicios."
			})
		}
	}

	return(
		<div className='HomePage'>
			<div className='BackgroundPage'>
				<h1>Bienvenido al Sistema de Gestion de Inscripciones Extension</h1>
				<h3>
				Este sistema permite gestionar las inscripciones de los estudiantes de 
				extension de la Facultad de Odontologia de la Universidad del Zulia.
				</h3>
				<h3>Para empezar seleccione una opcion del menu en la barra de navegacion</h3>
			</div>
			<h4>Todos los derechos reservados 2025© Universidad del Zulia, Facultad de odontologia, Departamento de T.I.C.</h4>
		</div>	
	)
}

export default Home