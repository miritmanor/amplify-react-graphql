import AWS from 'aws-sdk';
import { Storage } from 'aws-amplify';
import { useState } from 'react';

export default function FileUploader() {
  const s3 = new AWS.S3();
  const [fileUrl, setfileUrl] = useState(null);
  const [file, setFile] = useState(null);

  
  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  }
  const uploadToS3 = async () => {
    if (!file) {
      return;
    }
    try {
      await Storage.put(file.name, file, {
        //contentType: "image/png", // contentType is optional
      });
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
          <button onClick={uploadToS3}>Apply changes to products</button>
        </div>
      )}
      {fileUrl && (
        <div style={{ marginTop: '10px' }}>
          <img src={fileUrl} alt="uploaded" />
        </div>
      )}
    </div>
  );
}
