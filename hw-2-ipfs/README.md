
# Dapp Quick Start Guide

Welcome to your step-by-step guide to getting your Dapp up and running quickly! Follow the instructions below to set up your development environment and start your application.

## 1. Download all needed packages

To get started, ensure you have the following essential tools installed:

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **React**: A JavaScript library for building user interfaces.
- **Hardhat**: An Ethereum development environment for professionals.
- **IPFS Client**: A peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open.

## 2. Starting the Dapp

Navigate to your project directory and execute the following commands based on your setup needs:

### Initialize and Start IPFS

Depending on whether you already have an IPFS node set up or not, you will either initialize a new node or start the daemon.

```bash
ipfs init   # Only needed the first time
ipfs daemon # Starts the IPFS daemon
```

### Start the Local Blockchain

```bash
npx hardhat node
```

### Deploy the Smart Contract

Deploy your smart contract to the local blockchain network using:

```bash
npx hardhat run scripts/StorageDeploy --network localhost
```

### Start the Website

Launch your Dapp's frontend interface:

```bash
npm start
```

### Connect MetaMask to Your Local Network

To interact with your Dapp, connect MetaMask to your local Hardhat network:

1. Click on "+ add network".
2. Enter the following network parameters:
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`

### Prepare Your Account

Ensure the address you intend to use has zero transactions. This is crucial for matching the nonce on the local chain with MetaMask when sending transactions.

### Send Test ETH to Your Address

Populate your address with test Ether for transactions:

```bash
npx hardhat run scripts/SendValue --network localhost
```

Replace `your_address_here` in the script with your actual address.

### If you encounter issues with uploading files

If you have problems uploading files, the issue might be related to IPFS permissions for cross-network communication. To resolve this, configure the IPFS settings by entering the following commands in your console:

```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "["http://localhost:3000"]"  # Assuming your React.js App is running on this port
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "["PUT", "POST", "GET"]"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers "["Content-Type"]"
```

### Ready to Go!


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.