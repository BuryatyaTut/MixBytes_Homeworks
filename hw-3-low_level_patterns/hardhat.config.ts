import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();
const API_URL = process.env.API_URL as string;


const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    forking: {
      url: API_URL, 
    }
  }
};

export default config;
