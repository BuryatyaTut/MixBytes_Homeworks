import hre from "hardhat";
import { Storage } from "../typechain-types/Storage";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.attach(contractAddress) as Storage;

  const hashToStore = "blablablatestesttest";

  const transactionResponse = await storage.updateHash(hashToStore);
  await transactionResponse.wait();

  console.log(`Hash "${hashToStore}" stored successfully.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
