import React, { useEffect, useContext, useState } from 'react'
import { getBillables, getDolarPrice } from '../client/client'
import { appContext } from '../context/appContext'
const Home = () => {

	const {setPrices, setDolarPrice, messageApi, ContextHolder} = useContext(appContext)

	useEffect(() => {
		fetchPrices()
		fetchDolar()
	}, [])

	const fetchDolar = async () => {
		const res = await getDolarPrice()
		setDolarPrice(res)
	}

	const fetchPrices = async () => {
		const res = await getBillables()
		if(res.status === 200){
			setPrices(res.data)
		}else{
			messageApi.open({
				type: 'error',
				content: "error al obtener precios de servicios"
			})
		}
	}

	// const fetchPrices = async () => {
	// 	const res = await getBillables()
	// 	setPrices(res.data)
	// }

	// const fetchDolar = async () => {
	// 	const res = await getDolarPrice()
	// 	if(res.status === 200){
	// 		setDolarPrice(res.data)
	// 	}else{
	// 		messageApi.open({
	// 			type: 'error',
	// 			content: "error al obtener la tasa de cambio"
	// 		})
	// 	}
	// }

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