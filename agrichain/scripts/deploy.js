import hre from "hardhat";

async function main() {
  console.log("Deploying AgriChain...");

  const AgriChain = await hre.ethers.getContractFactory("AgriChain");
  const agrichain = await AgriChain.deploy();

  // In Ethers v6, we use waitForDeployment()
  await agrichain.waitForDeployment();

  const address = await agrichain.getAddress();
  console.log("------------------------------------------");
  console.log("SUCCESS: AgriChain deployed to:", address);
  console.log("------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});