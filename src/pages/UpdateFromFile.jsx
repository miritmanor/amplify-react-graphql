import React, { useState, useEffect, useRef } from "react";
import { updateStoreFromList } from "../utils/lambdaAccess.js";
import { Storage } from "aws-amplify";
import { getS3FileContents } from "../utils/lambdaAccess.js";
import { fetchStores } from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { Status, setMultipleStatus } from "../utils/status.js";
import { MultipleLists } from "../utils/lists.js";
import {
  Flex,
  Heading,
  Button,
  Text,
  View,
  CheckboxField,
} from "@aws-amplify/ui-react";

const UpdateFromFile = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [columns, setColumns] = useState([]);
  const fileInputRef = useRef(null);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [changes, setChanges] = useState([]);
  const [status, setStatus] = useState("");
  const [storeUpdateStatus, setStoreUpdateStatus] = useState([]);
  const [storeUpdateResults, setStoreUpdateResults] = useState([]);
  const parallelExecution = false;

  const resultsColumns = [
    "SKU",
    "Name",
    "Supplier",
    "Result",
    "Store",
    "Details",
  ];

  //Runs only on the first render
  useEffect(() => {
    fetchStores(setStores);
  }, []);

  useEffect(() => {
    // add main DB to list of stores
    console.log("in useEffect stores");
    console.log("stores: ", stores);
    const mainDbIncluded = stores.find((item) => item.StoreName === "Main DB");
    if (!mainDbIncluded) {
      console.log("Main DB not in stores");
      setStores((stores) => [...stores, { StoreName: "Main DB" }]);
    } else {
      console.log("Main DB already in stores");
    }
  }, [stores]);

  useEffect(() => {
    //console.log("fileContent: ", fileContent);
    console.log("new file content available. size is ", fileContent.length);
    setStatus("");
    if (fileContent.length > 0 && fileContent[0]) {
      setColumns(Object.keys(fileContent[0]));
    }
  }, [fileContent]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    console.log("selected file: ", selectedFile);
    setFile(selectedFile);
    uploadFile(selectedFile);
  };

  const cleanup = () => {
    // todo arrange, maybe remove set status from here, and maybe not clear the selected stores and file contents immediately.
    //setStatus("");
    setFileContent([]);
    setChanges([]);
    setSelectedStores([]);

    setStoreUpdateStatus([]);
    setStoreUpdateResults([]);
  };

  const analyzeGetResults = (results) => {
    //console.log("in analyzeGetResults");
    //console.log("results: ", results);
    //console.log("type: ", typeof results);
    if (typeof results === "string") {
      setStatus("Error retrieving file contents: " + results);
      return;
    }
    setFileContent(results);
  };

  const uploadFile = async (selectedFile) => {
    console.log("in uploadFile");
    //console.log(" file to upload is: ", selectedFile);
    if (!selectedFile) {
      console.log("no file");
      return;
    }
    cleanup();
    setStatus("Uploading file " + selectedFile.name);
    try {
      const tempfilename = Date.now() + "-" + selectedFile.name;
      //console.log("tempfilename: ", tempfilename);
      //setFilename(tempfilename);
      const result = await Storage.put(tempfilename, selectedFile, {
        //contentType: "image/png", // contentType is optional
        progressCallback(progress) {
          console.log(`Upload status: ${progress.loaded}/${progress.total}`);
          if (progress.loaded === progress.total) {
            //setStatus("File uploaded. Retrieving file contents");
            //getS3FileContents(tempfilename, analyzeGetResults);
            console.log("file " + tempfilename + " uploaded");
          }
        },
      });
      console.log("result: ", result.key, result.key);
      setStatus("File uploaded. Retrieving file contents");
      getS3FileContents(tempfilename, analyzeGetResults);
      //console.log("file " + tempfilename + " uploaded");
      //console.log(rc);

      //setStatus("");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const handleApplyToStores = () => {
    console.log("in handleApplyToStores");
    applyValuesToStores(fileContent, selectedStores);
  };

  const CheckboxSelectStores = () => {
    //console.log("in CheckboxSelectStores:" );

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

  const setStatusMultipleStores = () => {
    setStatus(setMultipleStatus(storeUpdateStatus));
  };

  const setResultsMultipleStoreUpdates = () => {
    //var resultList = [];
    //for (var i in storeUpdateResults) {
    //resultList = resultList.concat(storeUpdateResults[i]);
    //}
    setChanges(MultipleLists(storeUpdateResults));
  };

  const applyValuesOneStore = async (storename, values) => {
    try {
      storeUpdateStatus[storename] = "Waiting for store " + storename;

      const response = await updateStoreFromList(storename, values);
      //console.log(response);
      //console.log("response type: ", typeof response);
      if (typeof response === "string") {
        // string means error
        storeUpdateStatus[storename] =
          "Failed to apply to store " + storename + ": " + response;
        return response;
      }

      const results = response;
      if (results.length === 0) {
        storeUpdateStatus[storename] =
          "No differences found for store " + storename;
      } else {
        storeUpdateStatus[storename] =
          "Completed applying to store " + storename;
      }
      // prepare to display - add to each line also a 'store' attribute
      const storeResults = results.map((line) => ({
        ...line,
        Store: storename,
      }));

      storeUpdateResults[storename] = storeResults;

      return response;
    } catch (error) {
      console.error(error);
      const response = error;
      storeUpdateStatus[storename] =
        "Problems while applying to store " + storename + ": " + error;
      storeUpdateResults[storename] = [];
      return response;
    }
  };

  // apply the file contents to the selected stores - same updates for all the selected stores

  const applyValuesToStores = (values, stores) => {
    console.log("in applyValuesToStores");

    //console.log("selected stores: ",selectedStores);

    if (stores.length !== 0) {
      //cleanup();
      setStoreUpdateStatus([]);
      setStoreUpdateResults([]);
      setChanges([]);
      setStatus("Applying changes to stores: " + setMultipleStatus(stores));

      if (parallelExecution) {
        updateStoresParallel(stores, values);
      } else {
        updateStoresSequential(stores, values);
      }
    } else {
      setStatus("No stores selected");
      setChanges([]);
    }
  };

  const updateStoresSequential = async (selectedStores, values) => {
    // execute sequentially
    console.log("in updateStoresSequential");
    for (var i in selectedStores) {
      storeUpdateStatus[selectedStores[i]] =
        "Store " + selectedStores[i] + " pending";
    }
    for (i in selectedStores) {
      await applyValuesOneStore(selectedStores[i], values);
      //console.log(res);
      setStatusMultipleStores();
      setResultsMultipleStoreUpdates();
    }
  };

  const updateStoresParallel = (selectedStores, values) => {
    // execute in parallel
    console.log("in updateStoresParallel");
    for (var i in selectedStores) {
      applyValuesOneStore(selectedStores[i], values).then((res) => {
        //console.log(res);
        setStatusMultipleStores();
        setResultsMultipleStoreUpdates();
      });
    }
  };

  const DisplayResults = () => {
    return (
      <>
        {changes && changes.length !== 0 && (
          <>
            <Heading level={5}>Results</Heading>
            <OrderedDictionaryArrayTable
              items={changes}
              columns={resultsColumns}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>
        Select file to upload updates. Later you can select and update stores.
      </h3>
      <Flex alignItems="left" alignContent="flex-start" direction="column">
        <Flex alignItems="left" alignContent="flex-start" direction="column">
          <Flex alignItems="center" alignContent="flex-start">
            <Text> File to import from: </Text>
            <Button onClick={handleButtonClick}> Choose File </Button>
            <Text className="file-name">{file && file["name"]}</Text>
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              className="hidden-file-input"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            {fileContent && fileContent.length !== 0 && (
              <>
                <CheckboxSelectStores></CheckboxSelectStores>
                <Button onClick={handleApplyToStores}>
                  Apply to selected stores
                </Button>
              </>
            )}
          </Flex>
          <h4>
            <Status status={status} />{" "}
          </h4>
        </Flex>
        <DisplayResults />
        {fileContent && fileContent.length !== 0 && (
          <>
            <Heading level={5}>File contents</Heading>
            <OrderedDictionaryArrayTable
              items={fileContent}
              columns={columns}
            />
          </>
        )}
      </Flex>
    </div>
  );
};

export default UpdateFromFile;
