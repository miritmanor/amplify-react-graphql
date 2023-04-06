

function Row({ row}) {
    var columns=[];

    Object.keys(row).forEach((key, index) => {
        //console.log(key,row[key])
        columns.push(
          <td> {row[key]} </td>
        ) ;
    });

    return (
    <>
      <tr>
      {columns}
      </tr>
      </>
    );
  }

  
  export function Table(rowList) {

    const rows = [];

    var header=0; 

    //console.log(rowList);

    rowList.forEach((row) => {
        if (header === 0) {
            var headercolumns=[];
            Object.keys(row).forEach((key, index) => {
                headercolumns.push(
                    <th> {key} </th>
                ) ;
            });
            rows.push(
                <tr> {headercolumns} </tr>
            );
            header=1;
        }
        rows.push(
            <Row row={row} />
        );
    });

    return (
        <>
            <table>
                <tbody>
                {rows}
                </tbody>
            </table>
        </>
    );
}


