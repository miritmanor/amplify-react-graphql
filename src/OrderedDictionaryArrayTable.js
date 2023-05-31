import React from 'react';

export function OrderedDictionaryArrayTable(props) {
  const dictionaries = props.items;
  const columnOrder = props.columns;

  // perform action upon selecting a row in the table
  const handleRowClick = (event) => { 
    const row = event.target.parentNode;
    console.log("row:",row)
    // get a function from props that will handle the click
    const action = props.action;
    if (action) {
      action(row);
    }
    //const sku = row.cells[0].innerText;
    //const change = {SKU:sku,Name:name,Supplier:supplier,Details:details,Store:store,Result:result};
  }


  if (dictionaries && dictionaries.length ===0) {
    return <> </>
  }

  if (!dictionaries) {
    return <> Nothing to display</>
  }
  const rows = dictionaries.map((dictionary, index) => {
    const cells = columnOrder.map((key) => {
      return <td key={key}>{dictionary[key]}</td>;
    });

    return <tr key={index} onClick={handleRowClick}>{cells}</tr>;
  });

  // insert code in each row to handle click
  //rows.forEach((row) => { 
    //row.onclick = handleRowClick;
  //});

  return (
    <table>
      <thead>
        <tr>
          {columnOrder.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default OrderedDictionaryArrayTable;

