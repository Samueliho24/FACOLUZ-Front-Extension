export function validateName(original){

    const exp = new RegExp(/^[^0-9]*$/);

    if(exp.test(original)){
        original = original
    }else{
        original = original.slice(0,-1);
    }

    let final = original;

    for(let i = 0; i <= original.length - 1; i++){
        if(i === 0){
            final = final[0].toUpperCase() + original.slice(1)
        }else if(original[i] === " " && original[i+1] != undefined){        
            final = final.slice(0, i) + " " + final[i+1].toUpperCase() + final.slice(i+2)
        }else if(original[i] != " "){                                     
            final = final.slice(0, i) + final.slice(i)
        }else{
            final = final.slice(0, i) + " " + final.slice(i+1)
        }
    }

    return final
}