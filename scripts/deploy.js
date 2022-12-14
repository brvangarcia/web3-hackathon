// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const DVideos = await hre.ethers.getContractFactory("DVideos");
  const dvideos = await DVideos.deploy();

  await dvideos.deployed();

  console.log("Contract deployed to", dvideos.address);

  const DVDao = await hre.ethers.getContractFactory("DVDao");
  const dVDao = await DVDao.deploy(dvideos.address);

  await dVDao.deployed();

  console.log("Contract deployed to", dVDao.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
