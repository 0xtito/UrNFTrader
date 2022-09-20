import { ethers } from "ethers";
import UrNFTrader from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
// import setupEvents from "./setupEvents";
// import setBuyOrder from "./setBuyOrder";
import setupEvents from "./setupEvents";
import seaportAbi from "../app/JSON/Seaport.json"
import {orders} from '../orderObject.json'
import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
const { OpenSeaSDK, Network: NetworkSDK } = require("opensea-js")
require("dotenv").config()
import "./index.css"

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
const options = {method: 'GET', headers: {accept: 'application/json'}};
// const provider = new ethers.providers.Web3Provider(ethereum);
// console.log(ethereum);
// console.log(ethereum.selectedAddress);
// console.log((new ethers.providers.Web3Provider(ethereum).get));


/* Testing 
  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: NetworkSDK.Goerli,
  });

  const asset = await openseaSDK.api.getOrder({
    assetContractAddress: tinyfrensContract,
    side: 'ask',
    tokenId: '1',
  })
*/

setupEvents()

const testNum = ethers.utils.parseEther("1.0");
const addTestNum = testNum.add(ethers.utils.parseEther('0.015'));
console.log(addTestNum);

async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner();
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
  const baseFee = ethers.utils.parseEther("0.015");


  const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  // const triggerPrice = document.getElementById('max-buy-price').value;
  const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value);
  const purchasePricePlusFee = purchasePrice.add(baseFee);
  console.log(purchasePrice);
  console.log(purchasePricePlusFee);  
  await urNFTrader.connect(signer).setPriceToBuy(nftCollectionAddress, { value: purchasePricePlusFee});
}

// async function cancelOrder() {
//   const provider = new ethers.providers.Web3Provider(ethereum);
//   await ethereum.request({ method: "eth_requestAccounts" });
//   const signer = provider.getSigner(0);
//   const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
// }

document.getElementById('create-order').addEventListener('click', newOrder);
// document.getElementById('cancel-order').addEventListener('click', cancelOrder); 



