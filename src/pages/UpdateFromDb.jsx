import React, { useState, useEffect } from "react";
import {
  invokeLambdaDirectly,
  checkServerResponse,
} from "../utils/lambdaAccess.js";
import { fetchStores, fetchSuppliers } from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { Status, setMultipleStatus } from "../utils/status.js";
import { MultipleLists, changesList } from "../utils/lists.js";
import {
  Button,
  SelectField,
  CheckboxField,
  View,
  Flex,
  Text,
  Heading,
} from "@aws-amplify/ui-react";

const UpdateFromDb = () => {
  const [status, setStatus] = useState(""); // status string to display

  const [inputs, setInputs] = useState({});

  const [stores, setStores] = useState([]); // stores for selection
  const [selectedStores, setSelectedStores] = useState([]); // selected stores
  const [suppliers, setSuppliers] = useState([]); // suppliers for selection

  const [results, setResults] = useState([]); // the list to display with results - either differences to view or update results
  const [selectedResults, setSelectedResults] = useState([]);

  const onSelectionChange = (selectedRows) => {
    setSelectedResults(selectedRows);
  };

  const [storeStatus, setStoreStatus] = useState([]); // list of status strings for each store
  const [storeResults, setStoreResults] = useState([]); // list of results for each store
  /*
  const [storeGetDiffsStatus, setStoreGetDiffsStatus] = useState([]);
  const [storeDifferences, setStoreDifferences] = useState([]);
  */
  const parallelExecution = false; // if true, apply to all stores in parallel, otherwise apply to one store at a time

  useEffect(() => {
    //Runs only on the first render
    fetchStores(setStores);
    fetchSuppliers(setSuppliers, ""); // fetch all suppliers, not filtered by store, as there is no store selection yet
  }, []);

  const setStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeStatus));
  };

  const setResultsMultipleStores = () => {
    //setChanges(changesList(body, "Details"));
    //setResults(MultipleLists(changesList(storeResults, "Details")));
    setResults(MultipleLists(storeResults));
  };
  /*
  const setDiffStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeGetDiffsStatus));
  };

  const setDiffsMultipleStores = () => {
    setResults(MultipleLists(storeDifferences));
  };
  */

  async function applyOneStore(storename, supplier) {
    console.log("applyOneStore", storename, supplier);
    try {
      const queryStringParameters = {
        supplier: supplier,
      };
      storeStatus[storename] = "Waiting for store " + storename;

      const response = await invokeLambdaDirectly(
        "PUT",
        "/changes/{storename+}",
        "/changes/" + storename,
        { storename: storename },
        queryStringParameters,
        ""
      );
      console.log(response);

      const message = checkServerResponse(response);
      if (message !== "") {
        console.log("Error: ", message);
        storeStatus[storename] =
          "Failed applying to store " + storename + ": " + message;
        storeResults[storename] = "";
      } else {
        const payload = JSON.parse(response.Payload);
        const body = JSON.parse(payload.body);
        console.log("body:", body);
        if (body.length === 0) {
          storeStatus[storename] =
            "No differences found for store " + storename;
        } else {
          storeStatus[storename] = "Completed applying to store " + storename;
        }

        // prepare to display - add to each line also a 'store' attribute
        storeResults[storename] = body.map((line) => ({
          ...line,
          Store: storename,
        }));
      }
      return response;
    } catch (error) {
      console.error(error);
      const response = error;
      storeStatus[storename] =
        "Problems while applying to store " + storename + ": " + error;
      storeResults[storename] = [];
      return response;
    }
  }

  async function viewDiffsSingleStore(storename, supplier) {
    console.log("viewDiffsSingleStore", storename, supplier);
    try {
      const queryStringParameters = {
        supplier: supplier,
      };
      storeStatus[storename] = "Waiting for store " + storename;

      const response = await invokeLambdaDirectly(
        "GET",
        "/changes/{storename+}",
        "/changes/" + storename,
        { storename: storename },
        queryStringParameters,
        ""
      );
      console.log("response from lambda: ", response);

      const message = checkServerResponse(response);
      if (message !== "") {
        console.log("Error: ", message);
        storeStatus[storename] =
          "Failed getting differences for store " + storename + ": " + message;
        storeResults[storename] = "";
      } else {
        const payload = JSON.parse(response.Payload);
        const body = JSON.parse(payload.body);
        console.log("body:", body);
        if (body.length === 0) {
          storeStatus[storename] =
            "No differences found for store " + storename;
        } else {
          storeStatus[storename] =
            "Completed  getting differences for store " + storename;
        }

        // prepare to display - add to each line also a 'store' attribute
        const diffList = changesList(body, "Details");
        console.log("diffList:", diffList);
        storeResults[storename] = diffList.map((line) => ({
          ...line,
          Store: storename,
        }));
      }
      return response;
    } catch (error) {
      console.error(error);
      storeStatus[storename] =
        "Problems while getting differences for store " +
        storename +
        ": " +
        error;
      storeResults[storename] = [];
      return error;
    }
  }

  const viewDiffsMultipleStores = () => {
    console.log(
      "in viewDiffsMultipleStores. selected stores: ",
      selectedStores
    );
    setResults([]);
    if (selectedStores.length !== 0) {
      setStatus(
        "Retrieving main db differences for stores: " +
          setMultipleStatus(selectedStores)
      );

      //cleanup previous results for all stores
      setStoreStatus([]);
      setStoreResults([]);

      for (var i in selectedStores) {
        viewDiffsSingleStore(selectedStores[i], inputs.supplier).then((res) => {
          //console.log(res);
          setStatusMultipleStores();
          setResultsMultipleStores();
        });
      }
    } else {
      setStatus("No stores selected");
    }
  };

  const applyToStores = () => {
    console.log("in applytoStores. selected stores: ", selectedStores);
    setResults([]);
    if (selectedStores.length !== 0) {
      setStatus(
        "Applying changes to stores: " + setMultipleStatus(selectedStores)
      );

      setStoreStatus([]);
      setStoreResults([]);

      if (parallelExecution) {
        // execute simultaneously
        updateStoresParallel(selectedStores, inputs.supplier);
      } else {
        updateStoresSequential(selectedStores, inputs.supplier);
      }
    } else {
      setStatus("No stores selected");
    }
  };

  const updateStoresSequential = async (selectedStores, supplier) => {
    for (var i in selectedStores) {
      storeStatus[selectedStores[i]] =
        "Store " + selectedStores[i] + " pending";
    }
    // execute sequentially
    for (i in selectedStores) {
      await applyOneStore(selectedStores[i], supplier);
      //console.log(res);
      setStatusMultipleStores();
      setResultsMultipleStores();
    }
  };

  const updateStoresParallel = (selectedStores, supplier) => {
    // execute in parallel
    for (var i in selectedStores) {
      applyOneStore(selectedStores[i], supplier).then((res) => {
        //console.log(res);
        setStatusMultipleStores();
        setResultsMultipleStores();
      });
    }
  };

  function InputForm() {
    const CheckboxSelectStores = () => {
      console.log("in CheckboxSelectStores:");

      const handleStoreSelectionChange = (e) => {
        const name = e.target.name;

        if (selectedStores.includes(name)) {
          setSelectedStores(selectedStores.filter((id) => id !== name));
        } else {
          setSelectedStores([...selectedStores, name]);
        }
      };

      return (
        <Flex direction="row" gap="0" paddingTop="5px">
          <Text paddingTop="20px">Select stores</Text>
          <View paddingLeft="20px" paddingTop="10px" paddingRight="30px">
            {stores &&
              stores.map((store) => (
                <CheckboxField
                  key={store.StoreName}
                  value={store.StoreName}
                  name={store.StoreName}
                  label={store.StoreName}
                  checked={selectedStores.includes(store.StoreName)}
                  onChange={handleStoreSelectionChange}
                />
              ))}
          </View>
        </Flex>
      );
    };

    const handleSupplierChange = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setInputs((values) => ({ ...values, [name]: value }));
      setStatus("");
      setResults([]);
    };

    return (
      <Flex alignItems="left" alignContent="flex-start" direction="column">
        <Flex alignItems="center" alignContent="flex-start">
          <SelectField
            key="supplier"
            name="supplier"
            placeholder="All suppliers"
            value={inputs.supplier || ""}
            onChange={handleSupplierChange}
          >
            {suppliers &&
              suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
          </SelectField>
          <CheckboxSelectStores></CheckboxSelectStores>
          <Button
            key="viewdiffs"
            name="view_diffs"
            onClick={viewDiffsMultipleStores}
          >
            View differences from DB
          </Button>
          <Button key="applydiffs" name="apply_changes" onClick={applyToStores}>
            Apply differences from DB
          </Button>
        </Flex>
      </Flex>
    );
  }

  function DisplayContent() {
    if (results.length !== 0) {
      //const columns = ["SKU", "Name", "Supplier", "Result", "Store", "Details"];
      const columns = [
        "SKU",
        "Name",
        "Supplier",
        "Result",
        "Store",
        "Field name",
        "Value in main DB",
        "Value in store",
        "Details",
      ];

      return (
        <>
          <Heading level={4}>Results</Heading>
          <OrderedDictionaryArrayTable items={results} columns={columns} />
        </>
      );
    } else {
      return "";
    }
  }

  console.log("changes:", results);
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Select stores to apply changes</h2>
      <InputForm />
      <h4>
        <Status status={status} />{" "}
      </h4>
      <DisplayContent />
    </div>
  );
};

export default UpdateFromDb;
