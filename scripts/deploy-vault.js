require("dotenv").config();
const hre = require("hardhat");
const ethers = hre.ethers;
const path = require("path");
const EthDeployUtils = require("eth-deploy-utils");
let deployUtils;

const { expect } = require("chai");

async function main() {
  deployUtils = new EthDeployUtils(path.resolve(__dirname, ".."), console.log);

  const chainId = await deployUtils.currentChainId();

  const [deployer] = await ethers.getSigners();

  if (chainId === 1337) {
    // on localhost, we deploy the factory
    await deployUtils.deployNickSFactory(deployer);
  }

  const registry = deployUtils.getAddress(chainId, "CrunaRegistry");
  const guardian = deployUtils.getAddress(chainId, "Guardian");
  const managerProxy = deployUtils.getAddress(chainId, "ManagerProxy");

  // deploy the vault
  const vault = await deployUtils.deploy("SerpentShields.sol", deployer.address);
  // const vault = await deployUtils.attach("SerpentShields.sol");

  // await deployUtils.Tx(vault.init(registry, guardian, managerProxy, { gasLimit: 120000 }), "Init vault");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
