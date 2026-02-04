import React, { useState } from 'react'
import { Input, Select } from 'antd'

const InputPhone = ({setter}) => {

    const phonePrefixList = (
        <Select defaultValue="0414" onChange={e=>setPhonePrefix(e)}>
            <Option value="0416">0416</Option>
            <Option value="0426">0426</Option>
            <Option value="0414">0414</Option>
            <Option value="0424">0424</Option>
            <Option value="0412">0412</Option>
            <Option value="0422">0422</Option>
        </Select>
    )

    const [phonePrefix, setPhonePrefix] = useState('0414')

    const [internValue, setInternValue] = useState('')
    const regex = new RegExp(/^\d+$/)

    const validate = (e) => {
        const check = regex.test(e)
        if(check){
            setter(`${phonePrefix}${e}`)
            setInternValue(e)
        }else{
            const corrected = e.slice(0,-1)
            setter(`${phonePrefix}${corrected}`)
            setInternValue(corrected)
        }
    }

    return(
        <Input
            addonBefore={phonePrefixList}
            onChange={e=>validate(e.target.value)}
            value={internValue}
            maxLength={7}
        />
    )
}

export default InputPhone;