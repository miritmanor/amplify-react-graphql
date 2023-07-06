

export const Status = ({status}) => {

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

export const setMultipleStatus = (statusList) => {
    var message = "";
    for (var i in statusList) {
      message = message + statusList[i] + ", ";
    }
    return(message);
  };



