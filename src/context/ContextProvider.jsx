import { appContext } from './appContext'
import { useState } from 'react'
import { message } from 'antd'
import React from 'react'

const ContextProvider = ({children}) => {

	const [userData, setUserData] = useState('')
	const [logged, setLogged] = useState(false)
	const [prices, setPrices] = useState('')
	const [currentModuleEnrollment, setCurrentModuleEnrollment] = useState('')
	const [currentPeriodSection, setCurrentPeriodSection] = useState('')
	const [moduleList, setModuleList] = useState([])
	const [teacherList, setTeacherList] = useState([])
	const [messageApi, contextHolder] = message.useMessage()
	const [dolarPrice, setDolarPrice] = useState(0)
	
	return(
		<appContext.Provider value={{
			userData,
			setUserData,
			logged,
			setLogged,
			prices,
			setPrices,
			currentModuleEnrollment,
			setCurrentModuleEnrollment,
			currentPeriodSection,
			setCurrentPeriodSection,
			moduleList,
			setModuleList,
			teacherList,
			setTeacherList,
			messageApi,
			contextHolder,
			dolarPrice,
			setDolarPrice
		}} >
			{children}
		</appContext.Provider>
	)
}

export default ContextProvider