const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {

  const accounts = await ethers.provider.listAccounts();
  const MyNFTrader = await ethers.getContractFactory("MyNFTrader");
  const myNFTrader = await MyNFTrader.deploy(accounts, 2);

  await myNFTrader.deployed();

  console.log("MultiSig deployed to:", myNFTrader.address);
  const config = { address: myNFTrader.address }
  fs.writeFileSync("./src/__config.json", JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
  });
    
