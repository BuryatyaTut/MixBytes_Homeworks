import dotenv from "dotenv";
import {ethers, network} from "hardhat";
import {time} from "@nomicfoundation/hardhat-toolbox/network-helpers";

const API_URL = process.env.API_URL as string;

const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const USDTaddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const VitaliksAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

async function main(){
    console.log("hello");
    console.log(API_URL);
    // const provider = new ethers.providers.JsonRpcProvider(API_URL);

    const vitalik = await ethers.getImpersonatedSigner("0xe1EcF8EF96A4A01E1cB713321564530DC3165A8C");
    const balance = await ethers.provider.getBalance(vitalik);
    console.log("Vitalik's balance in ETH %s", balance / BigInt(1e18));

    const [owner, addr1] = await ethers.getSigners();

    // 1 Deploying Token Contract
    const ITMOToken = await ethers.getContractFactory("ITMOToken");
    const itmoToken = await ITMOToken.connect(vitalik).deploy(); 

    const mintAmount = BigInt(100) * BigInt(10**18);
    await itmoToken.mint(vitalik, mintAmount);
    await itmoToken.mint(addr1, mintAmount);
    console.log("Vitalik's balane of ITM token is: %s", await itmoToken.balanceOf(vitalik));

    // 2 Implement Swap with Univ2 My token to USDT

    const router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);
    const usdt = await ethers.getContractAt("IERC20Copy", USDTaddress);

    console.log("Vitaliks USDT balance: %s", (await usdt.balanceOf(vitalik)) / BigInt(10**6));

    const amount = BigInt(100);
    const amountADesired = amount * BigInt(10**18);
    const amountBDesired = amount * BigInt(10**6);
    const deadline = await time.latest() + 100;
    
    // Approve The token A
    await itmoToken.connect(vitalik).approve(router, amountADesired);
    console.log("The allowance for ITMO: %s", await itmoToken.allowance(vitalik, router));
    // Approve the Token B
    // await usdt.connect(vitalik).approve(router, amountBDesired);
    console.log(await usdt.allowance(vitalik, router));
    
    const pair = await router.connect(vitalik).addLiquidity(await itmoToken.getAddress(), USDTaddress, amountADesired, amountBDesired, amount, amount, vitalik, deadline);
    
    console.log("contract pair address is %s", pair);
    
    //2.3 Implement swap from ITMOToken to USDT
    const amountIn = BigInt(20) * BigInt(10**18);
    const amountOutMin = 1;
    const path = [itmoToken, usdt];
    const deadline2 = await time.latest() + 100;


    console.log("---------------------------------------");
    await itmoToken.connect(addr1).approve(routerAddress, amountIn);
    console.log("addt1 native eth balance: %s", await ethers.provider.getBalance(addr1));

    console.log("The ADDR1 USDT BALANCE: %S", await usdt.balanceOf(addr1));
    await router.connect(addr1).swapExactTokensForTokens(amountIn, amountOutMin, path, addr1, deadline2);
    console.log("The ADDR1 USDT BALANCE: %S", await usdt.balanceOf(addr1));


    console.log("---------------------------------------");
    await itmoToken.connect(addr1).approve(routerAddress, amountIn);
    console.log("addt1 native eth balance: %s", await ethers.provider.getBalance(addr1));

    console.log("The ADDR1 USDT BALANCE: %S", await usdt.balanceOf(addr1));
    await router.connect(addr1).swapExactTokensForTokens(amountIn, amountOutMin, path, addr1, deadline2);
    console.log("The ADDR1 USDT BALANCE: %S", await usdt.balanceOf(addr1));

}




dotenv.config();
main();