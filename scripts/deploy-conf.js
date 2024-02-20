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

  const vault = await deployUtils.attach("SerpentShields.sol");
  const factory = await deployUtils.attach("SerpentShieldsFactory");

  await deployUtils.Tx(factory.setPrice(5000, { gasLimit: 60000 }), "Setting price");
  await deployUtils.Tx(factory.setDiscount(3010), "Setting discount");

  const usdc = await deployUtils.getAddress(chainId, "USDCoin");
  await deployUtils.Tx(factory.setStableCoin(usdc, true), "Setting stable coin");

  await deployUtils.Tx(vault.setFactory(factory.address, { gasLimit: 100000 }), "Setting factory");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
