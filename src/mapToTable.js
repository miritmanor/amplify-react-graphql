

function OneRow({ row},{mykey}) {
    var columns=[];

    Object.keys(row).forEach((key, index) => {
        //console.log(key,row[key])
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

  
  export function Table(rowList,rowkey) {

    const rows = [];
 
    //console.log(rowList);

    var headercolumns=[];
    Object.keys(rowList[0]).forEach((key, index) => {
        headercolumns.push(
            <th> {key} </th>
        ) ;
    });

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


