import React, {useContext} from "react";
import { routerContext } from "../context/routerContext"
import ErrorPage from '../pages/ErrorPage'
import ConsultarRegistros from '../pages/ConsultarRegistros'
import Home from '../pages/Home'
import Login from '../pages/Login'
import EmitirFactura from '../pages/EmitirFactura'
import VerificarFactura from '../pages/VerificarFactura'
import Configuracion from '../pages/Configuracion'
import Estudiantes from '../pages/Students'
import Modulos from "../pages/Modulos"
import Cursos from "../pages/Cursos"
import Periodos from "../pages/Periodos"
import Enrollments from "../pages/Enrollments"
import NewEnrollment from "../pages/NewEnrollment"
import ModuleEnrollment from "../pages/ModuleEnrollment"

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
            case "ModuleEnrollment": return <ModuleEnrollment />
            case "NewEnrollment": return <NewEnrollment />
            case "Enrollments": return <Enrollments />
            case "Periodos": return <Periodos />
            case "Estudiantes": return <Estudiantes />
            case "Modulos": return <Modulos />
            case "Cursos": return <Cursos />
            default: return <ErrorPage />
        }
    }catch(err){
        return <ErrorPage />
    }
}

export default Router;