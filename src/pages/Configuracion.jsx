import React, { useEffect, useContext, useState } from 'react';
import { Divider, Input, Button, Form} from 'antd';
import { appContext } from "../context/appContext";
import { getBillables, savePrices } from "../client/client";

const Configuracion = () => {
    const {messageApi, contextHolder, prices, setPrices} = useContext(appContext);
    
    const [inscripcionPrice, setInscripcionPrice] = useState(prices.find(x => x.name === "Inscripcion").price);
    const [materiaPrice, setMateriaPrice] = useState(prices.find(x => x.name === "Materia").price);
    const [actividadEspecialPrice, setActividadEspecialPrice] = useState(prices.find(x => x.name === "Actividad especial").price);
    const [certificadoPrice, setCertificadoPrice] = useState(prices.find(x => x.name === "Reimpresion de certificado").price);

// Validación: no vacío y sólo números (acepta enteros y decimales)
    const isNumeric = (v) => {
        if (v === '' || v === null || v === undefined) return false;
        return /^-?\d+(\.\d+)?$/.test(String(v).trim());
    };

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
            if (!isNumeric(trimmed)) {
            messageApi.open({
                type: 'error',
                content: `${label}: debe ser un número válido`
            });
            hasError = true;
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
            <div className='listContainer Content' >
                <p>Aqui podras configurar los precios de referencia de los diferentes servicios. El monto debe ser en $.</p>
                <div className='row'>
                    <Form.Item label="Inscripcion:" className='rowItem'>
                        <Input 
                            id='inscripcionInput' 
                            value={inscripcionPrice} 
                            onChange={(e) => setInscripcionPrice(e.target.value)} 
                            className='rowItem' 
                            placeholder='Monto en $:'/>
                    </Form.Item>
                    <Form.Item label="Materia:" className='rowItem'>
                        <Input 
                            id='materiaInput'
                            value={materiaPrice}
                            onChange={(e) => setMateriaPrice(e.target.value)}
                            className='rowItem'
                            placeholder='Monto en $:'/>
                    </Form.Item>
                </div>
                <div className='row'>
                    <Form.Item label="Actividad especial:" className='rowItem'>
                        <Input 
                            id='actividadEspecialInput'
                            value={actividadEspecialPrice}
                            onChange={(e) => setActividadEspecialPrice(e.target.value)}
                            className='rowItem'
                            placeholder='Monto en $:'/>
                    </Form.Item>
                    <Form.Item label="Reimpresion de certificado:" className='rowItem'>
                        <Input 
                            id='certificadoInput'
                            value={certificadoPrice}
                            onChange={(e) => setCertificadoPrice(e.target.value)}
                            className='rowItem'
                            placeholder='Monto en $:'/>
                    </Form.Item>
                </div>
                <Button variant='solid' color='primary' onClick={()=>submit()}>Guardar cambios</Button>
            </div>
            <div className='EmptyFooter'/>
        </div>
    )
}

export default Configuracion;