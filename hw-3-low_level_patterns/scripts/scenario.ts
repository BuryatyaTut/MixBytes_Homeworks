import dotenv from "dotenv";
import {ethers, network} from "hardhat";
import {time} from "@nomicfoundation/hardhat-toolbox/network-helpers";

const API_URL = process.env.API_URL as string;

const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const VITALIK_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const DECIMALS_18 = BigInt(10**18);
const DECIMALS_6 = BigInt(10**6);

async function main(){
    console.log("Starting the script with this API_URL: %s", API_URL);

    const vitalik = await ethers.getImpersonatedSigner(VITALIK_ADDRESS);
    const balance = await ethers.provider.getBalance(vitalik);
    console.log(`Vitalik's balance: ${ethers.formatEther(balance)} ETH`);


    const [owner, addr1] = await ethers.getSigners();

    // 1 Deploying My Token Contract
    const ITMOToken = await ethers.getContractFactory("ITMOToken");
    const itmoToken = await ITMOToken.connect(vitalik).deploy(); 

    const mintAmount = BigInt(100) * DECIMALS_18;
    await itmoToken.mint(vitalik, mintAmount);
    await itmoToken.mint(addr1, mintAmount);
    console.log(`Vitalik's ITMO Token balance: ${ethers.formatEther(await itmoToken.balanceOf(vitalik.address))} ITMO`);

    // 2 Implement Swap with Univ2 {My token} to {USDT}

    const router = await ethers.getContractAt("IUniswapV2Router02", ROUTER_ADDRESS);
    const usdt = await ethers.getContractAt("IERC20Copy", USDT_ADDRESS);
    console.log(`Vitalik's USDT balance: ${ethers.formatUnits(await usdt.balanceOf(vitalik.address), 6)} USDT`);

    const amount = BigInt(100);
    const amountADesired = amount * DECIMALS_18;
    const amountBDesired = amount * DECIMALS_6;
    const deadline = await time.latest() + 100;
    
    // Approve The token A
    await itmoToken.connect(vitalik).approve(router, amountADesired);
    console.log(`ITMO Token allowance for router: ${ethers.formatEther(await itmoToken.allowance(vitalik.address, ROUTER_ADDRESS))} ITMO`);
    // Approve the Token B
    await usdt.connect(vitalik).approve(router, amountBDesired);
    console.log(`USDT allowance for router: ${ethers.formatUnits(await usdt.allowance(vitalik.address, ROUTER_ADDRESS), 6)} USDT`);

    
    const pair = await router.connect(vitalik).addLiquidity(await itmoToken.getAddress(), USDT_ADDRESS, amountADesired, amountBDesired, amount, amount, vitalik, deadline);
    
    console.log("Liquidity added to Uniswap");
    
    //2.3 Implement swap from ITMOToken to USDT
    console.log("----- Executing Swap -----");

    const amountIn = BigInt(20) * DECIMALS_18;
    const amountOutMin = 1;
    const path = [itmoToken, usdt];
    const deadline2 = await time.latest() + 100;

    await itmoToken.connect(addr1).approve(ROUTER_ADDRESS, amountIn);
    console.log(`Addr1 ETH balance: ${ethers.formatEther(await ethers.provider.getBalance(addr1.address))} ETH`);
    console.log(`Addr1 USDT balance before swap: ${ethers.formatUnits(await usdt.balanceOf(addr1.address), 6)} USDT`);

    await router.connect(addr1).swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        addr1.address,
        deadline2
    );
    console.log(`Addr1 USDT balance after swap: ${ethers.formatUnits(await usdt.balanceOf(addr1.address), 6)} USDT`);

    console.log("----- Repeating Swap -----");

    await itmoToken.connect(addr1).approve(ROUTER_ADDRESS, amountIn);
    console.log(`Addr1 ETH balance: ${ethers.formatEther(await ethers.provider.getBalance(addr1.address))} ETH`);
    console.log(`Addr1 USDT balance before swap: ${ethers.formatUnits(await usdt.balanceOf(addr1.address), 6)} USDT`);

    await router.connect(addr1).swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        addr1.address,
        deadline2
    );
    console.log(`Addr1 USDT balance after swap: ${ethers.formatUnits(await usdt.balanceOf(addr1.address), 6)} USDT`);


}




dotenv.config();
main();