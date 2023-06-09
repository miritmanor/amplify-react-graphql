import React, { useState, useEffect } from "react";
import "../App.css";
import "@aws-amplify/ui-react/styles.css";
import { fetchSuppliersFullDetails } from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";

import { Flex, View } from "@aws-amplify/ui-react";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // only on first render - fetch suppliers. when done it will set the suppliers array
  useEffect(() => {
    console.log("in useEffect - fetching");
    fetchSuppliersFullDetails(setSuppliers, "");
  }, []);

  // when suppliers changes, initiate filteredSuppliers to the same array
  useEffect(() => {
    console.log("in useEffect - suppliers ready");
    setFilteredSuppliers(suppliers);
  }, [suppliers]);

  // when the user enters something in the search(filter) string - wait a bit then filter the products array and put the results in filteredSuppliers
  useEffect(() => {
    console.log("in useEffect - search");
    const timeOutId = setTimeout(() => {
      if (!suppliers) {
        return false;
      }
      const p = suppliers.filter((item) => {
        for (var key in item) {
          if (item[key].toLowerCase().includes(searchTerm.toLowerCase()))
            return true;
        }
        return false;
      });
      setFilteredSuppliers(p);
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [searchTerm, suppliers]);

  const columns = ["supplier_name", "stores"];

  return (
    <View style={{ marginTop: "50px" }}>
      <h2>Commiz suppliers in main DB </h2>
      <Flex alignItems="center" alignContent="flex-start">
        <input
          type="text"
          placeholder="Search suppliers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Flex>
      <OrderedDictionaryArrayTable
        items={filteredSuppliers}
        columns={columns}
      />
    </View>
  );
};

export default Suppliers;
