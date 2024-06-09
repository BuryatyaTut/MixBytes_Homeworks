import React, { useState, useEffect } from "react";
import { create } from "ipfs-http-client";

const ipfs = create("http://localhost:5001"); // Connect to the local IPFS API

const UploadImage = () => {
  const [imageCID, setImageCID] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const savedCID = localStorage.getItem("imageCID");
    if (savedCID) {
      setImageCID(savedCID);
    }
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (imageFile) {
      try {
        const added = await ipfs.add(imageFile);
        setImageCID(added.path);
        localStorage.setItem("imageCID", added.path); // Save CID to local storage
      } catch (error) {
        console.error("Error uploading the file:", error);
      }
    }
  };

  return (
    <div>
      <h1>Upload and Display Image from IPFS</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {imageCID && (
        <div>
          <h2>Uploaded Image:</h2>
          <img src={`http://localhost:8080/ipfs/${imageCID}`} alt="Uploaded" />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
