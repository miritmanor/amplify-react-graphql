


function OneRow({ row }, { mykey }) {
    var columns = [];

    try {
        Object.keys(row).forEach((key, index) => {
            console.log(key,row[key])
            columns.push(
                <td> {row[key]} </td>
            ) ;
        });

        return (
            <>
                <tr key={mykey}>
                   {columns}
                </tr>
            </>
        );
    }
    catch (err) {
        console.log(err);
        return ("");
    }
}


export function Table({ rowList }, { rowkey }) {

    if (rowList.length === 0) {
        return "";
    }
    const rows = [];

    //console.log(rowList);

    var headercolumns = [];
    const headerkeys = [];
    Object.keys(rowList[0]).forEach((key, index) => {
        headercolumns.push(
            <th> {key} </th>
        );
        headerkeys.push(key);
    });

    console.log("headerkeys:", headerkeys);


    rowList.forEach((row) => {
        rows.push(
            <OneRow row={row} mykey={row[rowkey]}/>
        );
    });

    return (
        <>
            <table>
                <thead>
                    <tr>
                        {headercolumns}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </>
    );
}

export function MyTable({ rowList }, { rowkey }) {


    console.log(rowList);
    if (rowList.length !== 0) {
        var headercolumns = [];
        const headerkeys = [];
        Object.keys(rowList[0]).forEach((key, index) => {
            headercolumns.push(
                <th> {key} </th>
            );
            headerkeys.push(key);
        });
        console.log(headerkeys);

        const rows = rowList.map((dictionary, index) => {
            //each line is a dictionary.
            const cells = Object.entries(dictionary).map(([key, value]) => {
                return <td key={key}>{value}</td>;
            });
            //console.log(cells);
            return <tr key={index}>{cells}</tr>;
        }); 


        return (
            <table>
            <thead>
                <tr>
                {Object.keys(rowList[0]).map((key) => (
                    <th key={key}>{key}</th>
                ))}
                </tr>
            </thead>
            <tbody>{rows}</tbody>
            </table>
        ); 
        
   }

}



