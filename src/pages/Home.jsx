import React, { useEffect, useContext, useState } from 'react'
import { getSettings } from '../client/client'
import { appContext } from '../context/appContext'
const Home = () => {
	const {setPrices} = useContext(appContext)

	useEffect(() => {
		fetchSettings()
	}, [])

	const fetchSettings = async () => {
		const res = await getSettings()
		if (res?.data) {
			const pricesObj = Object.fromEntries(res.data.map(({ label, value }) => [label, value]));
			setPrices(pricesObj)
		}
	}

	return(
		<div className='HomePage'>
			<div className='BackgroundPage'>
				<h1>Bienvenido al modulo de administracion</h1>
				<h3>
					En este modulo podra gestionar y emitir facturas a los pacientes de 
					de las clinicas odontologicas de la facultad para distintas areas las
					cuales son necesarias para agendar una cita correctamente.
				</h3>
				<h3>Para empezar seleccione una opcion del menu en la barra de navegacion</h3>
			</div>
			<h4>Todos los derechos reservados 2025© Universidad del Zulia, Facultad de odontologia, Departamento de T.I.C.</h4>
		</div>	
	)
}

export default Home