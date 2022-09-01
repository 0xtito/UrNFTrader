const { ethers } = require('hardhat');
const { expect, assert } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const UrNFTrader = require('../app/artifacts/contracts/UrNFTrader.sol/UrNFTrader.json');
const wETHToken = require('../app/artifacts/contracts/WETHToken.sol/WETHToken.json');
const { urNFTraderAddress, WETHTokenAddress } = require('../app/__config.json');



describe('MyNFTrader', function() {
  let contract, owner, user;
  // async function deployContract() {
  //   // const MyNFTrader = await ethers.getContractFactory('MyNFTrader');
  //   const urNFTrader = await ethers.getContractAt(UrNFTrader.abi, urNFTraderAddress);
  //   [owner, user] = await ethers.getSigners();
  //   console.log(urNFTrader);
  //   // contract = await MyNFTrader.deploy();

  //   // await contract.deployed();

  //   return { urNFTrader, owner, user };
  // };


  describe('Testing deployment', function() {

    before(async () => {
      const urNFTrader = await ethers.getContractAt(UrNFTrader.abi, urNFTraderAddress);
      [owner, user] = await ethers.getSigners();
      console.log(urNFTrader, owner, user);
    });
    it('should retrieve important variables', async () => {
      const { urNFTrader, owner, user } = await loadFixture(deployContract);
      // console.log(urNFTrader, owner, user);
    })
    
  })
})