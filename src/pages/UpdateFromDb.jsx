import React, { useState, useEffect } from "react";
import {
  invokeLambdaDirectly,
  checkServerResponse,
} from "../utils/lambdaAccess.js";
import { fetchStores, fetchSuppliers } from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { Status, setMultipleStatus } from "../utils/status.js";
import { MultipleLists } from "../utils/lists.js";
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
  const [changes, setChanges] = useState([]);
  const [status, setStatus] = useState("");
  const [inputs, setInputs] = useState({});
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);

  const [storeUpdateStatus, setStoreUpdateStatus] = useState([]);
  const [storeUpdateResults, setStoreUpdateResults] = useState([]);

  const [storeGetDiffsStatus, setStoreGetDiffsStatus] = useState([]);
  const [storeDifferences, setStoreDifferences] = useState([]);

  useEffect(() => {
    //Runs only on the first render
    fetchStores(setStores);
    fetchSuppliers(setSuppliers, ""); // fetch all suppliers, not filtered by store, as there is no store selection yet
  }, []);

  const setStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeUpdateStatus));
  };

  const setResultsMultipleStoreUpdates = () => {
    setChanges(MultipleLists(storeUpdateResults));
  };

  const setDiffStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeGetDiffsStatus));
  };

  const setDiffsMultipleStores = () => {
    setChanges(MultipleLists(storeDifferences));
  };

  async function applyOneStore(storename, supplier) {
    console.log("applyOneStore", storename, supplier);
    try {
      const queryStringParameters = {
        supplier: supplier,
      };
      storeUpdateStatus[storename] = "Waiting for store " + storename;

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
        storeUpdateStatus[storename] =
          "Failed applying to store " + storename + ": " + message;
        storeUpdateResults[storename] = "";
      } else {
        const payload = JSON.parse(response.Payload);
        const body = JSON.parse(payload.body);
        console.log("body:", body);
        if (body.length === 0) {
          storeUpdateStatus[storename] =
            "No differences found for store " + storename;
        } else {
          storeUpdateStatus[storename] =
            "Completed applying to store " + storename;
        }

        // prepare to display - add to each line also a 'store' attribute
        const storeResults = body.map((line) => ({
          ...line,
          Store: storename,
        }));

        storeUpdateResults[storename] = storeResults;
      }
      return response;
    } catch (error) {
      console.error(error);
      const response = error;
      storeUpdateStatus[storename] =
        "Problems while applying to store " + storename + ": " + error;
      storeUpdateResults[storename] = [];
      return response;
    }
  }

  async function viewDiffsSingleStore(storename, supplier) {
    console.log("viewDiffsSingleStore", storename, supplier);
    try {
      const queryStringParameters = {
        supplier: supplier,
      };
      storeGetDiffsStatus[storename] = "Waiting for store " + storename;

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
        storeGetDiffsStatus[storename] =
          "Failed getting differences for store " + storename + ": " + message;
        setStoreDifferences[storename] = "";
      } else {
        const payload = JSON.parse(response.Payload);
        const body = JSON.parse(payload.body);
        console.log("body:", body);
        if (body.length === 0) {
          storeGetDiffsStatus[storename] =
            "No differences found for store " + storename;
        } else {
          storeGetDiffsStatus[storename] =
            "Completed  getting differences for store " + storename;
        }

        // prepare to display - add to each line also a 'store' attribute
        const storeDiffs = body.map((line) => ({
          ...line,
          Store: storename,
        }));

        storeDifferences[storename] = storeDiffs;
      }
      return response;
    } catch (error) {
      console.error(error);
      const response = error;
      storeGetDiffsStatus[storename] =
        "Problems while getting differences for store " +
        storename +
        ": " +
        error;
      storeDifferences[storename] = [];
      return response;
    }
  }

  const viewDiffsMultipleStores = () => {
    console.log(
      "in viewDiffsMultipleStores. selected stores: ",
      selectedStores
    );
    //setChanges([]); // todo check if needed
    if (selectedStores.length !== 0) {
      setStatus(
        "Retrieving main db differences for stores: " +
          setMultipleStatus(selectedStores)
      );

      //setStoreUpdateStatus([]);
      //setStoreUpdateResults([]);
      setStoreGetDiffsStatus([]);

      for (var i in selectedStores) {
        viewDiffsSingleStore(selectedStores[i], inputs.supplier).then((res) => {
          //console.log(res);
          setDiffStatusMultipleStores();
          setDiffsMultipleStores();
        });
      }
    } else {
      setStatus("No stores selected");
    }
  };

  const applyToStores = () => {
    console.log("in applytoStores. selected stores: ", selectedStores);
    setChanges([]);
    if (selectedStores.length !== 0) {
      var message =
        "Applying changes to stores: " + setMultipleStatus(selectedStores);

      setStatus(message);
      setStoreUpdateStatus([]);
      setStoreUpdateResults([]);

      for (var i in selectedStores) {
        applyOneStore(selectedStores[i], inputs.supplier).then((res) => {
          //console.log(res);
          setStatusMultipleStores();
          setResultsMultipleStoreUpdates();
        });
      }
    } else {
      setStatus("No stores selected");
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
      setChanges([]);
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
    if (changes.length !== 0) {
      const columns = ["SKU", "Name", "Supplier", "Result", "Store", "Details"];
      return (
        <>
          <Heading level={4}>Results</Heading>
          <OrderedDictionaryArrayTable items={changes} columns={columns} />
        </>
      );
    } else {
      return "";
    }
  }

  console.log("changes:", changes);
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
