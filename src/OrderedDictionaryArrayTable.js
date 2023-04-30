import React from 'react';

export function OrderedDictionaryArrayTable(props) {
  const dictionaries = props.items;
  const columnOrder = props.columns;

  if (dictionaries && dictionaries.length ===0) {
    return <> </>
  }

  /*
  var headercolumns = [];
  const headerkeys = [];
  Object.keys(dictionaries[0]).forEach((key, index) => {
      headercolumns.push(
          <th> {key} </th>
      );
      headerkeys.push(key);
  });
  console.log(headerkeys);
*/

  console.log("order:",columnOrder);
  const rows = dictionaries.map((dictionary, index) => {
    const cells = columnOrder.map((key) => {
      return <td key={key}>{dictionary[key]}</td>;
    });

    return <tr key={index}>{cells}</tr>;
  });

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

