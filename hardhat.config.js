const {requirePath} = require("require-or-mock");
// if missing, it sets up a mock
requirePath(".env");
requirePath("export/deployed.json");

require("dotenv").config();
require("@secrez/cryptoenv").parse(() => process.env.NODE_ENV !== "test" && !process.env.SKIP_CRYPTOENV);

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("solidity-coverage");

if (process.env.GAS_REPORT === "yes") {
  require("hardhat-gas-reporter");
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },

  },
  gasReporter: {
    currency: "USD",
    // coinmarketcap: env.coinMarketCapAPIKey
  },
};
