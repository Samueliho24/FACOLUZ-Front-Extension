export function currencyByName(name){
    if(name === "Transferencia" || name === "Efectivo"){
        return "Bs."
    }else if(name === "Exoneracion" || name === "Dolares"){
        return "$"
    }else{
        return ""
    }
}

export function isBs(name){
    if(name === "Transferencia" || name === "Efectivo"){
        return true
    }else{
        return false
    }
}

// ---------------------------------------------------------------------------
//  El <Select> de metodo de pago manda el INDICE 1..4 (context/lists.js), no el
//  nombre del ENUM. Los helpers de arriba reciben el nombre, porque lo que viene
//  de la base lo es; estos reciben el indice, porque lo que viene del formulario
//  es el indice.
//
//  Mezclarlos era el bug del modal de pago: comparaba `paymentMethod === 1` para
//  decidir la moneda y mandaba `paidAmount` en la unidad equivocada, asi que el
//  backend receiveia el cambio en Bs contra un saldo en USD.
// ---------------------------------------------------------------------------

/** Indice del <Select> -> nombre del ENUM de payments.receivedPaymentMethod. */
export const PAYMENT_METHOD_BY_INDEX = {
    1: 'Efectivo',
    2: 'Transferencia',
    3: 'Dolares',
    4: 'Exoneracion',
}

/** Nombre del ENUM a partir del valor del <Select>. '' si no es un indice valido. */
export function paymentMethodName(value){
    return PAYMENT_METHOD_BY_INDEX[value] || ''
}

/**
 * El metodo se cobra en bolivares. Dolares y Exoneracion no.
 * Acepta el indice del <Select> o el nombre del ENUM.
 */
export function isBsMethod(value){
    if (typeof value === 'number') {
        return value === 1 || value === 2
    }
    return isBs(value)
}

/** Una exoneracion no es dinero: no lleva monto, ni cambio, ni referencia. */
export function isExoneration(value){
    if (typeof value === 'number') {
        return value === 4
    }
    return value === 'Exoneracion' || value === 'Exoneración'
}