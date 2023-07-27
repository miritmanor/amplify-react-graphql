export function OrderedDictionaryArrayTable(props) {
  // eslint-disable-next-line
  //const [selectedLine, setSelectedLine] = useState(null);
  const dictionaries = props.items;
  const columnOrder = props.columns;
  const onSelectionChange = props.onSelectionChange;
  const onSelectAll = props.onSelectAll;
  const isChecked = props.isChecked;
  const isSelectAll = props.isSelectAll;

  var selectionEnabled = false;
  if (props.onSelectionChange) {
    selectionEnabled = true;
  }
  //const [selectAll, setSelectAll] = useState(false);

  //const [selectedRows, setSelectedRows] = useState([]);
  //const selectedRows=[];

  // perform action upon selecting a row in the table
  /*
  const handleRowClick = (event) => {
    const row = event.target.parentNode;
    const action = props.action;
    if (action) {
      action(row);
    }
  };
  */

  const handleCheckboxChange = (event, id) => {
    console.log("handleCheckboxChange. id:", id);
    onSelectionChange(event.target.checked, id);
  };

  const handleToggleSelectAll = () => {
    onSelectAll();
  };

  if (dictionaries && dictionaries.length === 0) {
    return <> </>;
  }

  if (!dictionaries) {
    return <> Nothing to display</>;
  }

  // Function to format the object as a nice string
  const formatObject = (obj) => {
    return JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, "$1:");
  };

  const rows = dictionaries.map((dictionary, index) => {
    const cells = columnOrder.map((key) => {
      let formattedValue =
        typeof dictionary[key] === "object"
          ? formatObject(dictionary[key])
          : dictionary[key];
      return <td key={key}>{formattedValue}</td>;
    });

    return (
      <tr key={index}>
        {selectionEnabled && (
          <td>
            <input
              type="checkbox"
              checked={isChecked(index)}
              onChange={(e) => handleCheckboxChange(e, index)}
            />
          </td>
        )}
        {cells}
      </tr>
    );
  });

  // insert code in each row to handle click
  //rows.forEach((row) => {
  //row.onclick = handleRowClick;
  //});

  return (
    <table>
      <thead>
        <tr>
          {selectionEnabled && (
            <th>
              <input
                type="checkbox"
                checked={isSelectAll()}
                onChange={handleToggleSelectAll}
              />
            </th>
          )}
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
