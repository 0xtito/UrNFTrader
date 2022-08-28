/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require('@nomicfoundation/hardhat-network-helpers');
require('ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.1",
  paths: {
    artifacts: "./app/artifacts",
  },
  networks: {
    localhost: {
      url: "http://localhost:8545"
    },
    rinkeby: {
      url: process.env.RINKEBY_API,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
