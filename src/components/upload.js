//import AWS from 'aws-sdk';
import { Storage } from 'aws-amplify';
import React, { useRef } from 'react';
import { useState } from 'react';
import {invokeLambdaDirectly,checkServerResponse} from "../utils/lambdaAccess.js";
import {OrderedDictionaryArrayTable} from "./OrderedDictionaryArrayTable.jsx";
import {Status} from "../utils/Status.js";
import {
  Flex,
  Button,
  Text,
  Heading,
} from "@aws-amplify/ui-react";
import "../App.css";

export default function FileUploader(props) {
  const refresh = props.refresh;
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
    /*
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
    */
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
    console.log("in applyChangesThroughS3"  );
    if (!file) {
      return;
    }

    console.log("file:",file);
    // load file contents
    const reader = new FileReader();
    reader.onload = () => {
      //setFileContents( reader.result);
      setUploadResults("");
    };
    try {
      console.log("reading file");
      reader.readAsBinaryString(file);
    }
    catch(err) {
      console.log("failed to read file");
    }

    // import changes
    try {
      console.log(file);
      setStatus("Uploading file");
      // set up a unique file name with  a timestamp
      const tempfilename=Date.now() + '-' +  file.name;
      await Storage.put(tempfilename, file, {
        //contentType: "image/png", // contentType is optional
      });
      setStatus("Importing to database");
      var results = await invokeLambdaDirectly("PUT",
        "/products/import_changes_from_file",
        "/products/import_changes_from_file",
        "",
        {"filename": tempfilename},
        "") ;

        const message=checkServerResponse(results);
        console.log("Checked server response, message: ",message)
        if (message !== "") {
            console.log("Error: ",message);
            setStatus(message);
        } else {
            const payload=JSON.parse(results["Payload"]); 

            if (payload.body.length === 0) {//empty
                setStatus("Failed to upload file, empty response");
            } else {
              //console.log("received results -",results["StatusCode"]);
              const o=JSON.parse(payload.body);
              const body=JSON.parse(o.body);
              console.log("Received results: ",body);
              if (typeof body === 'string' || body instanceof String) {
                setStatus("Failed to upload file: "+body);
                setUploadResults("");
              } else {
                setStatus("ready");
                setUploadResults(JSON.parse(o.body));
              }
              refresh();
            } 
        } 
    } catch (error) {
      console.log("Error uploading file: ", error);
      setStatus("Error uploading file: "+error);
      setUploadResults("");
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

    const columns=['sku', 'result', 'details'];
    if (uploadResults.length !== 0) {
        return (
          <div> 
          <Heading level={5} paddingBottom="5px">Results of changes to products</Heading>
           <OrderedDictionaryArrayTable items={uploadResults} columns={columns}/>
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
