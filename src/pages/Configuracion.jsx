import React, { useEffect, useContext, useState } from 'react';
import { Divider, Input, Button, Form} from 'antd';
import { appContext } from "../context/appContext";
import { getBillables, savePrices } from "../client/client";
import InputMoney from '../components/InputMoney';

const Configuracion = () => {
    const {messageApi, contextHolder, prices, setPrices} = useContext(appContext);
    
    const [inscripcionPrice, setInscripcionPrice] = useState(prices.find(x => x.name === "Inscripcion").price);
    const [materiaPrice, setMateriaPrice] = useState(prices.find(x => x.name === "Materia").price);
    const [actividadEspecialPrice, setActividadEspecialPrice] = useState(prices.find(x => x.name === "Actividad especial").price);
    const [certificadoPrice, setCertificadoPrice] = useState(prices.find(x => x.name === "Reimpresion de certificado").price);

    const validateFields = () => {
    // lista de pares [valor, etiqueta amena]
        const fields = [
            [inscripcionPrice, 'Inscripcion'],
            [materiaPrice, 'Materia'],
            [actividadEspecialPrice, 'Actividad especial'],
            [certificadoPrice, 'Reimpresion de certificado'],
        ];

        let hasError = false;

        fields.forEach(([value, label]) => {
            const trimmed = value === undefined || value === null ? '' : String(value).trim();
            if (trimmed === '') {
            messageApi.open({
                type: 'error',
                content: `${label}: no puede estar vacío`
            });
            hasError = true;
            return;
            }
        });

        return !hasError;
    };

    const submit = async () => {
        if (!validateFields()) {
            return;
        }

        const newPrices = {
            inscripcion: inscripcionPrice,
            materia: materiaPrice,
            actividadEspecial: actividadEspecialPrice,
            certificado: certificadoPrice,
        };

        const res = await savePrices(newPrices)
        if(res.status === 200){
            const resNew = await getBillables()
            if(resNew.status === 200){
                setPrices(resNew.data)
            }else{
                messageApi.open({
                    type: 'error',
                    content: 'Error al recargar los precios, reincie la app'
                })
            }
            messageApi.open({
                type: 'success',
                content: 'Configuración guardada con exito'
            });
        }else{
            messageApi.open({
                type: 'error',
                content: 'Error al guardar la configuración'
            });
        }
    };




    return(
        <div className='Configuracion Page'>
            <Divider className='PageTitle'><h1>Configuracion</h1></Divider>
            {contextHolder}
            <div className='listContainer Content'>
                <p>Aqui podras configurar los precios de referencia de los diferentes servicios. El monto debe ser en $.</p>
                <div className='items'>
                    <div className='item'>
                        <p>Inscripcion:</p>
                        <InputMoney
                            prefix="$"
                            value={inscripcionPrice} 
                            onChange={(e) => setInscripcionPrice(e)} 
                            placeholder='Monto:'/>
                    </div>
                    <div className='item'>
                        <p>Materia:</p>
                        <InputMoney 
                            prefix="$"
                            value={materiaPrice}
                            onChange={(e) => setMateriaPrice(e)}
                            placeholder='Monto:'/>
                    </div>
                    <div className='item'>
                        <p>Actividad especial:</p>
                        <InputMoney
                            prefix="$"
                            value={actividadEspecialPrice}
                            onChange={(e) => setActividadEspecialPrice(e)}
                            placeholder='Monto:'/>
                    </div>
                    <div className='item'>
                        <p>Reimpresion de certificado:</p>
                        <InputMoney
                            prefix="$"
                            value={certificadoPrice}
                            onChange={(e) => setCertificadoPrice(e)}
                            placeholder='Monto:'/>
                    </div>
                </div>
                <Button variant='solid' color='primary' onClick={()=>submit()}>Guardar cambios</Button>
            </div>
            <div className='EmptyFooter'/>
        </div>
    )
}

export default Configuracion;