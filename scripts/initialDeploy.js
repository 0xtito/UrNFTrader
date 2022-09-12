const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {

  const WETHRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const multicallAddress = "0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821";

  // const WETHToken = await ethers.getContractFactory("WETHToken");
  // const wETHToken = await WETHToken.deploy();

  // await wETHToken.deployed();

  // only need to get the address for the WETH since we are deploying it - when we deploy it on rinkeby/mainnet, we can forgo this part
  // const wETHTokenAddress = wETHToken.address;

  const UrNFTrader = await ethers.getContractFactory("UrNFTrader");
  const urNFTrader = await UrNFTrader.deploy(WETHRinkeby, multicallAddress);

  await urNFTrader.deployed();



  console.log("urNFTrader deployed to:", urNFTrader.address);
  // console.log("WETHToken deployed to:", wETHToken.address);

  const config = { urNFTraderAddress: urNFTrader.address , WETHTokenAddress: WETHRinkeby, multicallAddress: multicallAddress };
  // const config = { urNFTraderAddress: urNFTrader.address};
  fs.writeFileSync("./app/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
  });
    
