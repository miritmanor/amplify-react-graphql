import React, { useState, useRef } from "react";
import { Storage } from "aws-amplify";
import {getS3FileContents} from "../utils/lambdaAccess.js";
import {
    Flex,
    Button,
    Text,
  } from "@aws-amplify/ui-react";
import {OrderedDictionaryArrayTable} from "../utils/OrderedDictionaryArrayTable.js";

export default function FileUploader(props) {
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
      fileInputRef.current.click();
    };

    const handleFileSelect = (e) => {   
        const selectedFile = e.target.files[0];
        console.log("selected file: ",selectedFile);
        setFile(selectedFile);
    }

    const uploadFile = async () => {
        if (!file) {
            return;
        }
        try {
            console.log(file);
            const tempfilename=Date.now() + '-' +  file.name;
            console.log("tempfilename: ",tempfilename);
            //setFilename(tempfilename);
            await Storage.put(tempfilename, file, {
                //contentType: "image/png", // contentType is optional
            });
            console.log("file uploaded" + tempfilename);
            await GetFileContents(tempfilename);
            console.log("file contents retrieved");
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    }

    const handleApplyToStores = () => {
        console.log("in handleApplyToStores");
        props.applyToStores(fileContent);
    }

    const GetFileContents = async (filename) => {
        console.log("in GetFileContents. filename: ",filename); 
        if (!filename) {
            console.log("no filename");
            return;
        }
        const res = await getS3FileContents(filename,setFileContent);
        console.log("res: ",res);
        console.log("fileContent:", fileContent);
    }
      
    const DisplayFileContents = () => {
        if (fileContent) {
            console.log("in DisplayFileContents. fileContent: ",fileContent);   
            const columns=Object.keys(fileContent[0]);
            return (
                <Flex   alignItems="top"    alignContent="flex-start"  paddingTop="5px" paddingBottom="20px" direction="column">
                    <Text>File Contents:</Text>
                    <OrderedDictionaryArrayTable items={fileContent} columns={columns}/>
                </Flex>
            )
        } else {
            return (
               <> </>
            )
        }
    }

    return (
        <Flex direction="column">
          <Flex   alignItems="top"    alignContent="flex-start"  paddingTop="5px" paddingBottom="20px" direction="row"> 
            <Text> File to import from: </Text>
            <Button onClick={handleButtonClick}>
              Choose File
            </Button>
            <Text className="file-name">{file && file['name']}</Text>
            <input type="file" accept=".csv, .xls, .xlsx"  className="hidden-file-input" ref={fileInputRef} onChange={handleFileSelect}/>
             {file && (
                <Button onClick={uploadFile}>Upload file and display contents</Button> 
              )}
              {fileContent && (
                <Button onClick={handleApplyToStores}>Apply to selected stores</Button>
                )}
         </Flex>
         <Flex direction="row">
            <DisplayFileContents/>
         </Flex>
        </Flex>
      );
}
