import { ethers } from "ethers";
import dotenv from "dotenv";
import iPriceFeed from "../artifacts/contracts/IPriceFeed.sol/IPriceFeed.json";

dotenv.config();

const API_URL: string = process.env.ALCHEMY_MAINNET_HTTPS as string;
const PRIVATE_KEY: string = process.env.PRIVATE_KEY as string;
const CONTRACT_ADDRESS_USDETH: string = process.env.CONTRACT_ADDRESS_USDETH as string;
const CONTRACT_ADDRESS_LINKETH: string = process.env.CONTRACT_ADDRESS_LINKETH as string;
const CONTRACT_ADDRESS_USDTETH: string = process.env.CONTRACT_ADDRESS_USDTETH as string;

const provider = new ethers.providers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const priceContractETHUSD = new ethers.Contract(CONTRACT_ADDRESS_USDETH, iPriceFeed.abi, signer);
const priceContractLINKETH = new ethers.Contract(CONTRACT_ADDRESS_LINKETH, iPriceFeed.abi, signer);
const priceContractUSDTETH = new ethers.Contract(CONTRACT_ADDRESS_USDTETH, iPriceFeed.abi, signer);

let previousPriceETHUSD: number = 0;
let previousPriceLINKETH: number = 0;
let previousPriceUSDTETH: number = 0;

let lastBlockNumber = -1;

async function fetchAndLogPriceChanges() {
    console.log("going to fetch the price...");

    const stcETHUSD = await priceContractETHUSD.latestRoundData();
    const stcLINKETH = await priceContractLINKETH.latestRoundData();
    const stcUSDTETH = await priceContractUSDTETH.latestRoundData();

    const currentPriceETHUSD = stcETHUSD['answer'] / 1e8;
    const currentPriceLINKETH = stcLINKETH['answer'] / 1e18;
    const currentPriceUSDTETH = stcUSDTETH['answer'] / 1e18;

    if (currentPriceETHUSD !== previousPriceETHUSD) {
        console.log("Price change detected for USD/ETH: was %s, now %s", previousPriceETHUSD, currentPriceETHUSD);
        previousPriceETHUSD = currentPriceETHUSD;
    }
    if (currentPriceLINKETH !== previousPriceLINKETH) {
        console.log("Price change detected for LINK/ETH: was %s, now %s", previousPriceLINKETH, currentPriceLINKETH);
        previousPriceLINKETH = currentPriceLINKETH;
    }
    if (currentPriceUSDTETH !== previousPriceUSDTETH) {
        console.log("Price change detected for USDT/ETH: was %s, now %s", previousPriceUSDTETH, currentPriceUSDTETH);
        previousPriceUSDTETH = currentPriceUSDTETH;
    }
}


async function fetchAndLogPriceEveryBlock() {
    let blockNumber = await provider.getBlockNumber();

    if (blockNumber != lastBlockNumber) { 
        lastBlockNumber = blockNumber;

        const stcETHUSD = await priceContractETHUSD.latestRoundData();
        const stcLINKETH = await priceContractLINKETH.latestRoundData();
        const stcUSDTETH = await priceContractUSDTETH.latestRoundData();

        const currentPriceETHUSD = stcETHUSD['answer'] / 1e8;
        const currentPriceLINKETH = stcLINKETH['answer'] / 1e18;
        const currentPriceUSDTETH = stcUSDTETH['answer'] / 1e18;

        console.log("Price of USD/ETH: %s", currentPriceETHUSD);
        console.log("Price of LINK/ETH: %s", currentPriceLINKETH);
        console.log("Price of USDT/ETH: %s", currentPriceUSDTETH);
    }
}

async function main() {
    console.log("Hello, hardhat!");
    console.log(API_URL);

    // setInterval(fetchAndLogPriceChanges, 10000);
    setInterval(fetchAndLogPriceEveryBlock, 10000);
}

main();
