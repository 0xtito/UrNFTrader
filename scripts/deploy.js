const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {

  const UrNFTrader = await ethers.getContractFactory("UrNFTrader");
  const urNFTrader = await UrNFTrader.deploy();

  await urNFTrader.deployed();

  const WETHToken = await ethers.getContractFactory("WETHToken");
  const wETHToken = await WETHToken.deploy();

  await wETHToken.deployed();

  console.log("urNFTrader deployed to:", urNFTrader.address);
  console.log("WETHToken deployed to:", wETHToken.address);

  const config = { urNFTraderAddress: urNFTrader.address , WETHTokenAddress: wETHToken.address };
  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
  });
    
