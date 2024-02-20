require("dotenv").config();
const hre = require("hardhat");
const ethers = hre.ethers;
const path = require("path");
const EthDeployUtils = require("eth-deploy-utils");
const { normalize, deployContractViaNickSFactory, keccak256 } = require("../test/helpers");
let deployUtils;

const { expect } = require("chai");

async function main() {
  deployUtils = new EthDeployUtils(path.resolve(__dirname, ".."), console.log);
  const chainId = await deployUtils.currentChainId();

  const [deployer] = await ethers.getSigners();

  const vault = await deployUtils.attach("SerpentShields.sol");

  expect(await vault.owner()).to.equal(deployer.address);

  await deployUtils.deployProxy("SerpentShieldsFactory", vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
