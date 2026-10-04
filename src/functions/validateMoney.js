import validateNumber from "./validateNumber"

export default function validateMoney(raw){
    let original = validateNumber(raw);
    return original.toFixed(2);
}