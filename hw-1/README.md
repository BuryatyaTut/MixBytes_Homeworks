# Homework One

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

---

It might be useful to use ethers of version 5.4 or below, since I've had problems with more recent versions, more specifically with the providers.rpc() function.


I've decided to use these price feeds:

1. [ETH/USD](https://data.chain.link/feeds/ethereum/mainnet/eth-usd)
2. [LINK/ETH](https://data.chain.link/feeds/ethereum/mainnet/link-eth)
3. [USDT/ETH](https://data.chain.link/feeds/ethereum/mainnet/usdt-eth)

Their heartbeat is different:
1. 1 hour
2. 5 hours
3. 24 hours

Thus, in my opinion, it's better to check for price updates not every 10 seconds, as I did in my code, but perhaps over longer periods of time. For example, every 10 minutes or 30 minutes. Alternatively, consider finding other oracles, like those implemented on BSC: [this](https://oracle.binance.com/data-feeds/detail/bsc/BNB-USD)



---

in .env file you need to specify 

ALCHEMY_MAINNET_HTTPS=""

PRIVATE_KEY=""

CONTRACT_ADDRESS_USDETH="0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
CONTRACT_ADDRESS_LINKETH="0xDC530D9457755926550b59e8ECcdaE7624181557"
CONTRACT_ADDRESS_USDTETH="0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46"

---

**Example output:**

Hello, hardhat!
https://eth-mainnet.g.alchemy.com/v2/...  
going to fetch the price...  
Price change detected for USD/ETH: was 0, now 3073.18  
Price change detected for LINK/ETH: was 0, now 0.00554457  
Price change detected for USDT/ETH: was 0, now 0.000324726191656259  
going to fetch the price...  
going to fetch the price...  