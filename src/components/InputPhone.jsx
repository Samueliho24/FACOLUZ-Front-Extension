import React from 'react'
import { Input, Select } from 'antd'

const PREFIX_LENGTH = 4
const LOCAL_LENGTH = 7
const PREFIXES = ['0414', '0416', '0424', '0426', '0412', '0422']

const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '')

const InputPhone = ({ value, setter }) => {
    const digits = digitsOnly(value)

    const prefix = PREFIXES.includes(digits.slice(0, PREFIX_LENGTH))
        ? digits.slice(0, PREFIX_LENGTH)
        : '0414'
    const local = digits.slice(PREFIX_LENGTH, PREFIX_LENGTH + LOCAL_LENGTH)

    const prefixSelect = (
        <Select
            value={prefix}
            onChange={(nextPrefix) => setter(`${nextPrefix}${local}`)}
            options={PREFIXES.map((p) => ({ value: p, label: p }))}
            style={{ width: 82 }}
        />
    )

    return (
        <Input
            addonBefore={prefixSelect}
            value={local}
            maxLength={LOCAL_LENGTH}
            inputMode='numeric'
            onChange={(e) => {
                const cleanDigits = digitsOnly(e.target.value).slice(0, LOCAL_LENGTH)
                setter(`${prefix}${cleanDigits}`)
            }}
        />
    )
}

export default InputPhone;