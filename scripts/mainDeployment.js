const { ethers } = require("hardhat");
const fs = require('fs');
const { WETHTokenAddress } = require("../app/__config.json");
const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";
const seaportAddress = "0x00000000006c3852cbEf3e08E8dF289169EdE581";

async function main() {

  console.log(`start`)
  const UrNFTrader = await ethers.getContractFactory("UrNFTrader");
  console.log(`retrieved contract`)
  const urNFTrader = await UrNFTrader.deploy();
  console.log(`deploying...`)

  await urNFTrader.deployed();
  console.log(`deployed!`)


  console.log("urNFTrader deployed to:", urNFTrader.address);

  const config = { urNFTraderAddress: urNFTrader.address };
  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
  });