import React, { useState } from "react"
import { routerContext } from "./routerContext"

const RouterContextProvider = ({children}) => {

    const [view, setView] = useState('Login')

    return(
        <routerContext.Provider
            value={{
                view,
                setView
            }}
        >
            {children}
        </routerContext.Provider>
    )
}

export default RouterContextProvider