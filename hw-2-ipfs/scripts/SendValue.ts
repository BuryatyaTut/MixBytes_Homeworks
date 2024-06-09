import { ethers } from "hardhat";

async function main() {
  const [owner, addr1] = await ethers.getSigners();
  const metamaskAddress = "0xe94e503F33b81068e9423605e464043c04f73891" // your_address_here

  await addr1.sendTransaction({
    to: metamaskAddress,
    value: ethers.parseEther("1"),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
