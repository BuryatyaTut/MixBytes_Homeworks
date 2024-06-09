import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = 1_000_000_000n;

const StorageModule = buildModule("StorageModule", (m) => {
  const storage = m.contract("Storage");

  console.log("Storage Module Finished");
  return { storage };
});

export default StorageModule;
