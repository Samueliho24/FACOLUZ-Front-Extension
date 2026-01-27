import { appContext } from './appContext'
import { useState } from 'react'
import { message } from 'antd'
import React from 'react'

const ContextProvider = ({children}) => {

	const [userData, setUserData] = useState('')
	const [logged, setLogged] = useState(false)
	const [prices, setPrices] = useState('')
	const [messageApi, contextHolder] = message.useMessage()

	return(
		<appContext.Provider value={{
			userData,
			setUserData,
			logged,
			setLogged,
			prices,
			setPrices,
			messageApi,
			contextHolder
		}} >
			{children}
		</appContext.Provider>
	)
}

export default ContextProvider