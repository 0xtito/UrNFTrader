// import { keccak256 } from "ethers/lib/utils";
const { ethers } = require('ethers');
const UrNFTraderJSON = require("../app/artifacts/contracts/UrNFTrader.sol/UrNFTrader.json");
require('dotenv').config(); 
const privKey = process.env.PRIVATE_KEY;
const apiUrl = process.env.GOERLI_API_URL; 
const contract = "0x44CCeb9874Df3974d0D760aEa64B0b411a30F43E";


async function getRefund() {
  const provider = new ethers.providers.JsonRpcProvider(apiUrl);
  const IUrNFTrader = new ethers.utils.Interface(UrNFTraderJSON.abi)
  const abi = [ "function withdraw() external onlyOwner"];
  const urNFTContract = new ethers.Contract(contract, abi, provider);
  console.log(urNFTContract)
  // console.log(IUrNFTrader);ithdraw');
  const owner = new ethers.Wallet(privKey, provider);
  const tx = await urNFTContract.connect(owner).withdraw();
  console.log('sent');
  console.log('waiting'); 
  const receipt = await tx.wait();
  console.log(receipt);

}

getRefund();