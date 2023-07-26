import React, { useState, useEffect } from "react";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";

// todo integrate with OrderedDictionaryArrayTable, probably no need for a separate component here and for ProductsTableWithSelection
export function ContentsTableWithSelection(props) {
  const items = props.items;
  const columnOrder = props.columns;
  const onSelectionChange = props.onSelectionChange;

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    console.log("in useEffect. selectedRows changed:", selectedRows);
    onSelectionChange(selectedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  useEffect(() => {
    console.log("in useEffect. selectAll:", selectAll);
    if (selectAll) {
      setSelectedRows(items.map((item, index) => index));
    } else {
      setSelectedRows([]);
    }
  }, [selectAll]);

  const handleCheckboxChange = (isChecked, id) => {
    console.log("handleCheckboxChange. id:", id);

    if (isChecked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, id]);
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.filter((rowId) => rowId !== id)
      );
    }
  };

  const handleToggleSelectAll = () => {
    setSelectAll((prevSelectAll) => !prevSelectAll);
  };

  const isChecked = (index) => {
    return selectedRows.includes(index);
  };

  const isSelectAll = () => {
    return selectAll;
  };

  return (
    <OrderedDictionaryArrayTable
      items={items}
      columns={columnOrder}
      onSelectionChange={handleCheckboxChange}
      onSelectAll={handleToggleSelectAll}
      isChecked={isChecked}
      isSelectAll={isSelectAll}
    />
  );
}

export default ContentsTableWithSelection;
