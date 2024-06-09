import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { create } from "ipfs-http-client";
import Storage from "../contracts/Storage.sol/Storage.json";
import "./SmartContract.css";

const ipfs = create("http://localhost:5001"); // Connect to the local IPFS API
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract's address

const SmartContract = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [web3, setWeb3] = useState(null);
  const [imageCID, setImageCID] = useState("");
  const [retrievedCID, setRetrievedCID] = useState("");
  const [userCID, setUserCID] = useState(""); 

  useEffect(() => {
    if (web3 && walletAddress) {
      getCIDFromContract();
    }
  }, [web3, walletAddress]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Could not connect to wallet", error);
      }
    } else {
      alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const getCIDFromContract = async () => {
    if (!web3) return;
    const contract = new web3.eth.Contract(Storage.abi, contractAddress); 
    try {
      const cid = await contract.methods
        .getHash()
        .call({ from: walletAddress });
      setRetrievedCID(cid);
    } catch (error) {
      console.error("Error fetching CID from contract:", error);
    }
  };

  const getUserCID = async () => {
    if (!web3 || !walletAddress) return;
    const contract = new web3.eth.Contract(Storage.abi, contractAddress);
    try {
      console.log("goint to ask for my CID");
      const cid = await contract.methods
        .getHash()
        .call({ from: walletAddress });
      setUserCID(cid);
      console.log("my cid is", cid);
    } catch (error) {
      console.error("Error fetching user's CID from contract:", error);
    }
  };

  const handleFileChange = (e) => {
    setImageCID(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (imageCID) {
      try {
        const added = await ipfs.add(imageCID);
        const newCID = added.path;
        await setCIDInContract(newCID);
        setRetrievedCID(newCID);
      } catch (error) {
        console.error("Error uploading the file:", error);
      }
    }
  };

  const setCIDInContract = async (cid) => {
    console.log("SIGMA SID IS ", cid);
    if (!web3 || !walletAddress) return;
    const contract = new web3.eth.Contract(Storage.abi, contractAddress);
    try {
      console.log("The wallet address is", walletAddress);
      await contract.methods.updateHash(cid).send({ from: walletAddress });
    } catch (error) {
      console.error("Error setting CID in contract:", error);
    }
  };

  return (
    <div className="container">
      <button onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : "Connect Wallet"}
      </button>
      <div>
        <h2>Current Image</h2>
        {retrievedCID ? (
          <img
            src={`http://localhost:8080/ipfs/${retrievedCID}`}
            alt="IPFS Image"
          />
        ) : (
          <p>No image available</p>
        )}
      </div>
      <div>
        <input type="file" id="fileInput" onChange={handleFileChange} />
        <label htmlFor="fileInput">Choose File</label>
        <button onClick={handleUpload}>Upload and Update CID</button>
      </div>
      <div>
        <button onClick={getUserCID}>View My CID</button>
        {userCID && <p>Your CID: {userCID}</p>}
      </div>
    </div>
  );
};

export default SmartContract;
