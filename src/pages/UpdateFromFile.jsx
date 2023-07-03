import React, { useState, useEffect, useRef } from "react";
import {
  checkServerResponse,
  updateStoreFromList,
} from "../utils/lambdaAccess.js";
import { Storage } from "aws-amplify";
import { getS3FileContents } from "../utils/lambdaAccess.js";
import { fetchStores } from "../utils/lambdaAccess.js";
import { OrderedDictionaryArrayTable } from "../components/OrderedDictionaryArrayTable.jsx";
import { Status } from "../utils/status.js";
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

  //Runs only on the first render
  useEffect(() => {
    fetchStores(setStores);
  }, []);

  useEffect(() => {
    console.log("file: ", file);
  }, [file]);

  useEffect(() => {
    console.log("fileContent: ", fileContent);
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
    setStatus("");
    setFileContent([]);
  };

  const uploadFile = async (selectedFile) => {
    console.log("in uploadFile");
    console.log(" file to upload is: ", selectedFile);
    if (!selectedFile) {
      console.log("no file");
      return;
    }
    cleanup();
    try {
      const tempfilename = Date.now() + "-" + selectedFile.name;
      console.log("tempfilename: ", tempfilename);
      //setFilename(tempfilename);
      await Storage.put(tempfilename, selectedFile, {
        //contentType: "image/png", // contentType is optional
      });
      console.log("file uploaded" + tempfilename);
      await GetFileContents(tempfilename);
      console.log("file contents retrieved from file " + tempfilename);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const handleApplyToStores = () => {
    console.log("in handleApplyToStores");
    applyValuesToStores(fileContent, selectedStores);
  };

  const GetFileContents = async (filename) => {
    console.log("in GetFileContents. filename: ", filename);
    if (!filename) {
      console.log("no filename");
      return;
    }
    const res = await getS3FileContents(filename, setFileContent);
    console.log("res from getS3FileContents: ", res);
    console.log("fileContent:", fileContent);
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
    var message = "";
    for (var i in storeUpdateStatus) {
      message = message + storeUpdateStatus[i] + ", ";
    }
    setStatus(message);
  };

  const setResultsMultipleStoreUpdates = () => {
    var resultList = [];
    for (var i in storeUpdateResults) {
      resultList = resultList.concat(storeUpdateResults[i]);
    }
    setChanges(resultList);
  };

  async function applyValuesOneStore(storename, values) {
    try {
      storeUpdateStatus[storename] = "Waiting for store " + storename;

      const response = await updateStoreFromList(storename, values);
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

  const applyValuesToStores = (values, stores) => {
    console.log("in applyValuesToStores");

    //console.log("selected stores: ",selectedStores);

    if (stores.length !== 0) {
      var message = "Applying changes to stores: ";
      for (var i in stores) {
        message = message + stores[i] + ", ";
      }
      message = message + "...";

      setStatus(message);

      setStoreUpdateStatus([]);
      setStoreUpdateResults([]);
      setChanges([]);
      for (i in stores) {
        //var storename=selectedStores[i];
        applyValuesOneStore(stores[i], values).then((res) => {
          console.log(res);
          const message = checkServerResponse(res);
          if (message !== "") {
            console.log("Error: ", message);
            setStatusMultipleStores();
            setResultsMultipleStoreUpdates();
          } else {
            setStatusMultipleStores();
            setResultsMultipleStoreUpdates();
          }
        });
      }
    } else {
      setStatus("No stores selected");
      setChanges([]);
    }
  };

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

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Select file to import updates from stores</h3>
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
            <CheckboxSelectStores></CheckboxSelectStores>
            {fileContent && fileContent.length !== 0 && (
              <Button onClick={handleApplyToStores}>
                Apply to selected stores
              </Button>
            )}
          </Flex>
          <h4>
            <Status status={status} />{" "}
          </h4>
        </Flex>

        {fileContent && fileContent.length !== 0 && (
          <OrderedDictionaryArrayTable items={fileContent} columns={columns} />
        )}

        <DisplayContent />
      </Flex>
    </div>
  );
};

export default UpdateFromFile;
