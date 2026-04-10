import { Input } from 'antd';
import { appContext } from "../context/appContext";
import React, { useContext, useRef } from "react";

const InputGrade = ({ onChange, value }) => {
    const { messageApi } = useContext(appContext);
    const isMessageShowing = useRef(false);

    const showError = () => {
        if (!isMessageShowing.current) {
            isMessageShowing.current = true;
            messageApi.open({
                type: 'error',
                content: 'Ingrese una calificación entre 1 y 20, o SI',
                onClose: () => { isMessageShowing.current = false; }
            });
        }
    };

    const handleKeyDown = (e) => {
        const key = e.key;
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
        if (allowedKeys.includes(key)) return;

        // Solo permitir números y las letras S e I
        if (!/^[0-9sSiI]$/.test(key)) {
            e.preventDefault();
            showError();
        }
    };

    const handleInputChange = (e) => {
        let val = e.target.value.toUpperCase();
        
        if (val === '') {
            onChange('');
            return;
        }

        // Si es texto, solo permitimos que empiece con S o sea SI
        if (isNaN(val)) {
            if (val === 'S' || val === 'SI') {
                onChange(val);
            } else {
                onChange(''); // Limpia si es cualquier otra letra
                showError();
            }
            return;
        }

        // Si es número, validamos rango
        const num = parseInt(val, 10);
        if (num >= 1 && num <= 20) {
            onChange(val);
        } else {
            onChange(''); // Limpia si el número es > 20 o < 1
            showError();
        }
    };

    const handleBlur = () => {
        // Al salir del input, si quedó solo una "S", la limpiamos o la corregimos
        if (value === 'S') {
            onChange(''); 
            showError();
        }
    };

    return (
        <Input
            placeholder="Nota"
            value={value}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={2}
            style={{ width: '100px' }}
        />
    );
};

export default InputGrade;
