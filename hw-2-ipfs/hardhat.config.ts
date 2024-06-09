import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY as string;
const arbiscanKey = process.env.ARBISCAN_API_KEY as string;

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  networks: {
    // localhost: {
    //   chainId: 1337,
    //   url: "http://127.0.0.1:8545",
    //   // accounts: privateKey !== undefined ? [privateKey] : [],
    // },

    arbitrumSepolia: {
      chainId: 421614,
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [privateKey]
    }
  }, 

  etherscan: {
    apiKey: {
      arbitrumSepolia: arbiscanKey
    },
  },
};

export default config;
