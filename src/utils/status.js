

export function Status({status}) {

    console.log("status:",status);
    const s = status.toString();
    if (s === 'ready') {
        return ("");
    }
    return ( <>
         {s} 
        </>
    );
}


