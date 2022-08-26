const { ethers } = require('hardhat');
const { expect, assert } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe('MyNFTrader', function() {
  let contract, owner, user;
  async function deployContract() {
    const MyNFTrader = await ethers.getContractFactory('MyNFTrader');
    [owner, user] = await ethers.getSigners();
    contract = await MyNFTrader.deploy();

    await contract.deployed();

    return { contract, owner, user };
  };


  describe('Testing deployment', function() {

    before(async () => {
      await loadFixture(deployContract);
    });
    it('should retrieve important variables', async () => {
      console.log(contract, owner, user);
    })
    
  })
})