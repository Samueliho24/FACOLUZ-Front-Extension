import { Input } from "antd";
import React from "react"

const InputMoney = ({value, onChange, placeholder, disabled, style, prefix, onBlur, onPressEnter, suffix}) => {

    function validate(e){
        if(e == ""){
            return false;
        }

        //Esta expresion buscar una cantidad indefinida de caracteres seguida de un punto opcional y seguido de entre 0 y 2 caracteres
        const regex = new RegExp(/^[0-9]*\.?[0-9]{0,2}$/);
        let test = regex.test(e);
        
        if(test){
            return false;
        }else{
            return true;
        }
    }

    function correct(e){
        let res = e

        if(e[0] == "-"){
            res = e.slice(1,e.length);
        }else{
            res = e.slice(0,-1);
        }

        return res
    }

    const changedValue = (e) => {
        let res = e
        while(validate(res)){
            res = correct(res)
        }
        if(res[res.length - 1]!="."){
            res = Number(res);
        }
        onChange(res);
    }

    return(
        <Input
            value = {value}
            placeholder = {placeholder ?? null}
            onChange={e => changedValue(e.target.value)}
            disabled = {disabled ?? null}
            style = {style ?? null}
            prefix = {prefix ?? null}
            onBlur={onBlur ? (e => onBlur(e.target.value)) : null}
            onPressEnter={onPressEnter ?? null}
            suffix = {suffix ?? null}
        />
    )
}

export default InputMoney;