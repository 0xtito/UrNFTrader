const { ethers } = require("hardhat");
const fs = require('fs');
const { WETHTokenAddress } = require("../app/__config.json");

async function main() {

  console.log(`hey1`)
  const UrNFTrader = await ethers.getContractFactory("UrNFTrader");
  console.log(`hey2`)
  const urNFTrader = await UrNFTrader.deploy(WETHTokenAddress);
  console.log(`hey3`)

  await urNFTrader.deployed();
  console.log(`hey4`)


  console.log("urNFTrader deployed to:", urNFTrader.address);

  const config = { urNFTraderAddress: urNFTrader.address , WETHTokenAddress: WETHTokenAddress };
  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
  });