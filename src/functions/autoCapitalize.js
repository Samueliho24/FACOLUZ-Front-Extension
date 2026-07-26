export function autoCapitalize(original){
    // const words = original.split(" ")
    // if (words[0] === "")
    //     return "";
    // const capitalized = words.map(i => i[0].toUpperCase() + i.slice(1))
    let final = original;
    // for(let i = 0; i <= capitalized.length - 1; i++){
    //     final = final + capitalized[i] + ""
    //     if((capitalized[i].length > 1) && (i + 1 === capitalized.length)){
    //         final = final;
    //     }
    // }

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

// jesus lozano