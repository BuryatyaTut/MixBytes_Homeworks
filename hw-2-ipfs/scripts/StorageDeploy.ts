import hre from "hardhat";

// Contract Deployed on Address 0x0ee55bcB36d13E93D9A53360DfffaD984Ab7fdf9 at Arbitrum Sepolia testnet

async function main() {
  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  console.log("FileStorage deployed to:", storage);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
