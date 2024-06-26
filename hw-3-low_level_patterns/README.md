1. **Run Local Forked Node**
   
   ```shell
   npx hardhat node
   ```

2. **Run Script**

   ```shell
   npx hardhat run scripts/scenario.ts --network hardhat
   ```
3. **Create Your .env File**
    ```
        API_URL="<YOUR_API_URL_HERE>"
    ```

## Example Output

```
Starting the script with this API_URL: <YOUR_API_URL_HERE>
Vitalik's balance: 456.110666955260337134 ETH
Vitalik's ITMO Token balance: 100.0 ITMO
Vitalik's USDT balance: 914.883658 USDT
ITMO Token allowance for router: 100.0 ITMO
USDT allowance for router: 100.0 USDT
Liquidity added to Uniswap
----- Executing Swap -----
Addr1 ETH balance: 9999.999581777473121284 ETH
Addr1 USDT balance before swap: 0.054207 USDT
Addr1 USDT balance after swap: 16.679186 USDT
----- Repeating Swap -----
Addr1 ETH balance: 9999.99810732003386925 ETH
Addr1 USDT balance before swap: 16.679186 USDT
Addr1 USDT balance after swap: 28.559262 USDT
```



# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
