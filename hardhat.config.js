/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require('@nomicfoundation/hardhat-network-helpers');
require("@nomiclabs/hardhat-etherscan");
require('ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.7",
  paths: {
    artifacts: "./app/artifacts",
  },
  solc: {
    version: "0.8.7"
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2, process.env.PRIVATE_KEY3],
      gas: 'auto',
    },
    goerli: {
      url: process.env.GOERLI_API_URL,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2, process.env.PRIVATE_KEY3]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};
