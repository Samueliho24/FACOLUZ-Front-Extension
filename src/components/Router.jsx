import React, {useContext} from "react";
import { routerContext } from "../context/routerContext"
import ErrorPage from '../pages/ErrorPage'
import ConsultarRegistros from '../pages/ConsultarRegistros'
import Home from '../pages/Home'
import Login from '../pages/Login'
import EmitirFactura from '../pages/EmitirFactura'
import VerificarFactura from '../pages/VerificarFactura'
import Configuracion from '../pages/Configuracion'

const Router = () => {

    const {view} = useContext(routerContext)

    try{
        switch(view){
            case "Login": return <Login />
            case "Home": return <Home />
            case "EmitirFactura": return <EmitirFactura />
            case "VerificarFactura": return <VerificarFactura/>
            case "ConsultarRegistros": return <ConsultarRegistros />
            case "Configuracion": return <Configuracion />
            default: return <ErrorPage />
        }
    }catch(err){
        return <ErrorPage />
    }
}

export default Router;