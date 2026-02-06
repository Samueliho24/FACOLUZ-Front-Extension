import { Button, Divider } from "antd";
import React, { useContext, useState, useEffect } from "react";
import { getCurrentPeriod, closePeriod } from "../client/client";
import { appContext } from "../context/appContext";
import { ManagePeriodModal } from '../components/Modals'

const Periodos = () => {
	const [period, setPeriod] = useState(null)
    const {startedPeriod} = useContext(appContext)
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        const getPeriod = async () => {
            const period = await getCurrentPeriod()
            if(res.status == 200){
                setPeriod(period)
            }
        }
        getPeriod()
    }, [])

	return (
		<div className='ManagePeriods Page'>
            <Divider className="PageTitle"><h1>Manejo del periodo academico</h1></Divider>

            <div className="Content">
                { period ? (<>
                    <h2>Periodo actual: {period.year} - {period.period}</h2>
					<p>Fecha de inicio: {period.startDate}</p>
					<p>Fecha de fin: {period.endDate}</p>
                    <Button color="purple" variant="solid" onClick={() => setModalOpen(true)}>Cambiar estado del periodo</Button>
                    <Button color="purple" variant="solid" onClick={() => closePeriod(period.year, period.id).then(() => setPeriod(null))}>Cerrar periodo</Button>
                </>):(<>
                    <h2>El periodo actual aun no se encuentra en curso</h2>
                    <Button color="purple" variant="solid" onClick={() => setModalOpen(true)}>Iniciar periodo</Button>
                    <h3>Nota: Al iniciar el periodo solo se podra modificar la fecha de culminacion</h3>
                </>) }
            </div>
            <div className="EmptyFooter"/>
            <ManagePeriodModal open={modalOpen} period={period} onCancel={() => setModalOpen(false)}/>
		</div>
	)
}

export default Periodos;
