const { ethers } = require("hardhat");
const fs = require('fs');


async function main() {

  console.log(`start`)
  const UrNFTrader = await ethers.getContractFactory("UrNFTraderV1");
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