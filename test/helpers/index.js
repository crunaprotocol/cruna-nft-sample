const hre = require("hardhat");
const ethers = hre.ethers;
const BN = require("bn.js");

const Helpers = {
  bytes4(bytes32value) {
    return ethers.utils.hexDataSlice(bytes32value, 0, 4);
  },

  async getChainId() {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    return new BN(chainId, 10);
  },

  async getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp;
  },

  addr0: "0x" + "0".repeat(40),

  async increaseBlockTimestampBy(offset) {
    await ethers.provider.send("evm_increaseTime", [offset]);
    await ethers.provider.send("evm_mine");
  },

  amount(str) {
    return ethers.utils.parseEther(str);
  },

  normalize(amount, decimals = 18) {
    return amount + "0".repeat(decimals);
  },

  keccak256(str) {
    const bytes = ethers.utils.toUtf8Bytes(str);
    return ethers.utils.keccak256(bytes);
  },
};

module.exports = Helpers;
