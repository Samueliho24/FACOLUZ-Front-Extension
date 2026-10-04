export default function validateNumber(raw){
    const original = Number(raw)
    let res = original;

    if(original == undefined || original == null || original == NaN){
        res = 0;
    }else if(original.toString().includes("e")){
        res = original.toString().replace("e", "");
    } 
        
    if(original < 0){
        res = (original * -1);
    }

    return res;
}