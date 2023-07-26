import React, { useState, useEffect } from "react";
import {
  invokeLambdaDirectly,
  checkServerResponse,
} from "../utils/lambdaAccess.js";
import {
  fetchStores,
  fetchSuppliers,
  updateStoreFromList,
} from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { ContentsTableWithSelection } from "../components/ContentsTableWithSelection.jsx";
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

  const [results, setResults] = useState([]); // the list to display with update results
  const [storeResults, setStoreResults] = useState([]); // list of results for each store

  const [selectedDifferences, setSelectedDifferences] = useState([]);

  const [differences, setDifferences] = useState([]); // the list to display with differences
  //const [selectedDifferences, setSelectedDifferences] = useState([]);
  const [storeDifferences, setStoreDifferences] = useState([]); // list of results for each store

  const onDifferencesSelectionChange = (selectedRows) => {
    console.log("in onDifferencesSelectionChange. selectedRows:", selectedRows);

    setSelectedDifferences(
      differences.filter((line, index) => selectedRows.includes(index))
    );
  };

  const [storeStatus, setStoreStatus] = useState([]); // list of status strings for each store

  const parallelExecution = false; // if true, apply to all stores in parallel, otherwise apply to one store at a time

  useEffect(() => {
    //Runs only on the first render
    console.log("in useEffect. fetching stores and suppliers");
    fetchStores(setStores);
    fetchSuppliers(setSuppliers, ""); // fetch all suppliers, not filtered by store, as there is no store selection yet
  }, []);

  // when differences change, selection should be cleared
  useEffect(() => {
    setSelectedDifferences([]);
  }, [differences]);

  const setStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeStatus));
  };

  const setResultsMultipleStores = () => {
    console.log("in setResultsMultipleStores.");
    setResults(MultipleLists(storeResults));
  };

  const setDifferencesMultipleStores = () => {
    console.log("in setDifferencesMultipleStores.");
    setDifferences(MultipleLists(storeDifferences));
  };

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
        const body = JSON.parse(decodeURIComponent(payload.body));
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
        storeDifferences[storename] = "";
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
        storeDifferences[storename] = diffList.map((line) => ({
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
      storeDifferences[storename] = [];
      return error;
    }
  }

  const viewDiffsMultipleStores = () => {
    console.log(
      "in viewDiffsMultipleStores. selected stores: ",
      selectedStores
    );
    setDifferences([]);
    setResults([]);
    if (selectedStores.length !== 0) {
      setStatus(
        "Retrieving main db differences for stores: " +
          setMultipleStatus(selectedStores)
      );

      //cleanup previous results for all stores
      setStoreStatus([]);
      setStoreDifferences([]);

      for (var i in selectedStores) {
        viewDiffsSingleStore(selectedStores[i], inputs.supplier).then((res) => {
          //console.log(res);
          setStatusMultipleStores();
          setDifferencesMultipleStores();
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

  const applyValuesOneStore = async (storename, values) => {
    try {
      console.log("applyValuesOneStore", storename, values);
      storeStatus[storename] = "Waiting for store " + storename;

      const response = await updateStoreFromList(storename, values);
      //console.log(response);
      //console.log("response type: ", typeof response);
      if (typeof response === "string") {
        // string means error
        storeStatus[storename] =
          "Failed applying to store " + storename + ": " + response;
        storeResults[storename] = "";
        return response;
      }

      const results = response;
      if (results.length === 0) {
        storeStatus[storename] = "No differences found for store " + storename;
      } else {
        storeStatus[storename] = "Completed applying to store " + storename;
      }
      // prepare to display - add to each line also a 'store' attribute
      //const resultsList = changesList(results, "Details");
      const res = results.map((line) => ({
        ...line,
        Store: storename,
      }));

      storeResults[storename] = res;

      return response;
    } catch (error) {
      console.error(error);
      const response = error;
      storeStatus[storename] =
        "Problems while applying to store " + storename + ": " + error;
      storeResults[storename] = [];
      return response;
    }
  };

  const applySelectedChanges = async () => {
    // go over all selected stores. for each selected store, go over all selected results and apply them
    console.log(
      "in applySelectedChanges. selectedDifferences:",
      selectedDifferences
    );
    if (selectedDifferences.length === 0) {
      setStatus("No differences selected");
      return;
    }
    if (selectedStores.length === 0) {
      setStatus("No stores selected");
      return;
    }
    setStatus(
      "Applying selected changes to stores: " +
        setMultipleStatus(selectedStores)
    );
    setStoreStatus([]);
    setStoreResults([]);
    setDifferences([]); // cleanup displayed differences, they are not relevant any more
    // todo when differences change, selectedDifferences should be cleared.
    //setSelectedDifferences([]); // cleanup selected differences, they are not relevant any more

    // for each selected store, filter the results for this store, then create a list of changes to apply
    // the list of changes is a list of dictionaries, each dictionary contains the following keys:
    // SKU, the value of Field name, and the contents of Value in main DB.
    // Meanding the contents of 'Field name' is the label and the contents of teh Value in main DB is the value of this label
    // execute sequentially

    for (var i in selectedStores) {
      const store = selectedStores[i];
      await applyValuesOneStore(
        selectedStores[i],
        selectedDifferences
          .filter((line) => line.Store === store)
          .map((line) => ({
            SKU: line.SKU,
            [line["Field name"]]: line["Value in main DB"],
          }))
      );
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
        console.log(
          "in handleStoreSelectionChange. e.target.name:",
          e.target.name
        );
        const name = e.target.name;

        if (selectedStores.includes(name)) {
          setSelectedStores(selectedStores.filter((id) => id !== name));
        } else {
          setSelectedStores([...selectedStores, name]);
        }
      };

      return (
        <Flex direction="row" gap="0" paddingTop="5px">
          <Text paddingTop="20px">Stores</Text>
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

          <Button
            key="applyselected"
            name="apply_selected"
            onClick={applySelectedChanges}
          >
            Apply selected to selected stores
          </Button>

          <Button key="applydiffs" name="apply_changes" onClick={applyToStores}>
            Apply all changes from DB
          </Button>
        </Flex>
      </Flex>
    );
  }

  const resultsColumns = [
    "SKU",
    "Name",
    "Supplier",
    "Result",
    "Store",
    "Details",
  ];

  const differencesColumns = [
    "SKU",
    "Name",
    "Supplier",
    "Store",
    "Field name",
    "Value in main DB",
    "Value in store",
    "Details",
  ];

  console.log("changes:", results);
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Select stores to view and apply changes</h2>
      <InputForm />
      <h4>
        <Status status={status} />{" "}
      </h4>
      {results.length !== 0 && (
        <>
          <Heading level={4}>Results</Heading>
          <OrderedDictionaryArrayTable
            items={results}
            columns={resultsColumns}
          />
        </>
      )}
      {differences.length !== 0 && (
        <>
          <Heading level={4}>Differences</Heading>
          <ContentsTableWithSelection
            items={differences}
            columns={differencesColumns}
            onSelectionChange={onDifferencesSelectionChange}
          />
        </>
      )}
    </div>
  );
};

export default UpdateFromDb;
