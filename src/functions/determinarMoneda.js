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