//import AWS from 'aws-sdk';
import { Storage } from 'aws-amplify';
import React, { useRef } from 'react';
import { useState } from 'react';
import {invokeLambdaDirectly} from "../lambdaAccess.js";
import {Table} from "../mapToTable.js";
import {Status} from "../status.js";
import {
  Flex,
  Button,
  Text,
} from "@aws-amplify/ui-react";
import "../App.css";

export default function FileUploader() {
  //const s3 = new AWS.S3();
  //const [fileUrl, setfileUrl] = useState(null);
  const [file, setFile] = useState(null);
  //const [fileContents, setFileContents] = useState(null);
  const [uploadResults, setUploadResults] = useState("");
  const [status,setStatus] = useState("");

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    console.log("selected file: ",selectedFile);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      //setFileContents( reader.result);
      setUploadResults("");
    };
    try {
      reader.readAsBinaryString(selectedFile);
    }
    catch(err) {
      console.log("failed to read file");
    }
  }
   /*
  const uploadToS3 = async () => {
    if (!file) {
      return;
    }
    try {
      console.log(file);
      await Storage.put(file.name, file, {
        //contentType: "image/png", // contentType is optional
      });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }
  */

  const applyChangesThroughS3 = async () => {
    if (!file) {
      return;
    }
    try {
      console.log(file);
      setStatus("Uploading file");
      await Storage.put(file.name, file, {
        //contentType: "image/png", // contentType is optional
      });
      setStatus("Importing to database");
      var results = await invokeLambdaDirectly("PUT",
        "/products/import_changes_from_file",
        "/products/import_changes_from_file",
        "",
        {"filename": file.name},
        "") ;
      //console.log("received results -",results["StatusCode"]);
      const payload=JSON.parse(results["Payload"]);
      const o=JSON.parse(payload.body);
      console.log("Received results: ",JSON.parse(o.body));
      setStatus("ready");
      setUploadResults(JSON.parse(o.body));
    
    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }
  /* 
  const applyChangesFromFile = async () => {
    console.log("in applyChangesFromFile");
    if (!file) {
      return;
    }
    try {
      //const encoder = new TextEncoder();
      //const encodedFileContents = encoder.encode(fileContents).toString('base64');
      //const data = encodedFileContents;
      const data = fileContents;

      // Send the encoded data to Python using an HTTP request or a message queue


        await invokeLambdaDirectly("PUT",
        "/products/import_changes",
        "/products/import_changes",
        "",
        "",
        data) ;
    } catch (error) {
        console.log("Error uploading file: ", error);
    }

  }
  */

  function DisplayContent() {

    if (uploadResults.length !== 0) {
        return (
          <div> 
          <h2> Results of changes to products </h2>
           <Table rowList={uploadResults} rowkey='sku' />
           </div>
        )
    } else {
         return (
            " "
        )
    }
}

  return (
    <Flex   alignItems="top"    alignContent="flex-start"  paddingTop="5px" paddingBottom="20px" direction="column"> 
      <Flex   alignItems="center"    alignContent="flex-start"  paddingTop="5px" paddingBottom="20px" direction="row"> 
        <Text> File to import from: </Text>
        <Button onClick={handleButtonClick}>
          Choose File
        </Button>
        <Text className="file-name">{file && file['name']}</Text>
        <input type="file" accept=".csv, .xls, .xlsx"  className="hidden-file-input" ref={fileInputRef} onChange={handleFileSelect}/>
        {/* <input type="file" accept=".csv, .xls, .xlsx" onChange={handleFileSelect} /> */}
        {file && (
          <Flex >
            <Button onClick={applyChangesThroughS3}>Apply changes</Button> 
            <Status status={status} />
          </Flex>
        )}
        </Flex>
      <DisplayContent/>
    </Flex>
  );
}
