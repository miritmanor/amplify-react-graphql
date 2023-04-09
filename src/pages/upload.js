import AWS from 'aws-sdk';
import { Storage } from 'aws-amplify';
import { useState } from 'react';
import {invokeLambdaDirectly} from "../lambdaAccess.js";
import {Table} from "../mapToTable.js";

export default function FileUploader() {
  const s3 = new AWS.S3();
  const [fileUrl, setfileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [fileContents, setFileContents] = useState(null);
  const [uploadResults, setUploadResults] = useState("");

  const ShowResults = () => {
    if (uploadResults != "") {
      return ( <div> 
        <h2> Results of changes to products (new values displayed)</h2>
        {uploadResults} 
        </div>)
    } else {
      return ( <div>
        
      </div>)
    }
  }
  
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setFileContents( reader.result);
      setUploadResults("");
    };
    reader.readAsBinaryString(selectedFile);

   }
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

  const applyChangesThroughS3 = async () => {
    if (!file) {
      return;
    }
    try {
      console.log(file);
      await Storage.put(file.name, file, {
        //contentType: "image/png", // contentType is optional
      });
      var results = await invokeLambdaDirectly("PUT",
        "/products/import_changes_from_file",
        "/products/import_changes_from_file",
        "",
        {"filename": file.name},
        "") ;
      console.log("received results -",results["StatusCode"]);
      const payload=JSON.parse(results["Payload"]);
      const o=JSON.parse(payload.body);
      setUploadResults(Table(JSON.parse(o.body)),'sku');
    
    } catch (error) {
      console.log("Error uploading file: ", error);
    }

  }
  
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

  return (
    <div style={{ marginTop: '50px' }}>
      <h2>Upload Excel/CSV file for updating product data</h2>
      <input type="file" onChange={handleFileSelect} />
      {file && (
        <div style={{ marginTop: '10px' }}>
          {/*<button onClick={uploadToS3}>Apply changes to products</button> */}
          {/*<button onClick={applyChangesFromFile}>Apply changes to products</button> */}
          <button onClick={applyChangesThroughS3}>Apply changes to products main table</button> 
        </div>
      )}
      {fileUrl && (
        <div style={{ marginTop: '10px' }}>
          <img src={fileUrl} alt="uploaded" />
        </div>
      )}
      <ShowResults/>
    </div>
  );
}
