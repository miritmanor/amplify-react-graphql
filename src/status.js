

export function Status({status}) {

    if (status == 'ready') {
        return ("");
    }
    return ( 
        <h4> {status} </h4>
    );
}


