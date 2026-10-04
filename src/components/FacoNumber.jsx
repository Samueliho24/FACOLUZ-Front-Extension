import { Input } from "antd";
import React from "react"

const FacoNumber = ({value, onChange, placeholder, disabled, style, prefix, onBlur, onPressEnter}) => {
    
    function validate(e){
        if(e == ""){
            return false
        }
        const regexp = new RegExp(/^[0-9]*$/);
        if(regexp.test(e)){
            return false
        }else{
            return true
        }
    }

    function correct(e){
        let res;

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
        res = Number(res);
        onChange(res);
    }
    
    return(
        <Input
            value = {value}
            placeholder = {placeholder ?? null}
            onChange={e => changedValue(e.target.value)}
            disabled = {disabled ?? null}
            style = {style ?? style}
            prefix = {prefix ?? null}
            onBlur={e => onBlur(e.target.value)}
            onPressEnter={onPressEnter ?? null}
        />
    )
}

export default FacoNumber;