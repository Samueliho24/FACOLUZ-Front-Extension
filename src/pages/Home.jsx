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