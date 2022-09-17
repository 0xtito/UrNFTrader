import { ethers } from "ethers";
import UrNFTrader from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import checkApproval from "./checkApproval";
import revokeApproval from "./revokeApproval";
import approveAddress from './approveAddress';
import setBuyOrder from "./setBuyOrder";
import seaportAbi from "../app/JSON/Seaport.json"
import {orders} from '../orderObject.json'
const { OpenSeaSDK, Network: NetworkSDK } = require("opensea-js")
require("dotenv").config()
import "./index.css"

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
const options = {method: 'GET', headers: {accept: 'application/json'}};
const provider = new ethers.providers.Web3Provider(ethereum);

const abi = ethers.utils.defaultAbiCoder;
let parameters = {
  considerations: [],
  offerer: orders.protocol_data.parameters.offerer,
  zone: orders.protocol_data.parameters.zone,
  offerToken: orders.protocol_data.parameters.offer[0].token,
  offerIdentifier: parseFloat(orders.protocol_data.parameters.offer[0].identifierOrCriteria),
  offerStartAmount: parseFloat(orders.protocol_data.parameters.offer[0].startAmount),
  offerEndAmount: parseFloat(orders.protocol_data.parameters.offer[0].endAmount),
  basicOrderType: orders.protocol_data.parameters.orderType,
  startTime: orders.listing_time,
  endTime: orders.expiration_time,
  zoneHash: orders.protocol_data.parameters.zoneHash,
  salt: orders.protocol_data.parameters.salt,
  counter: orders.protocol_data.parameters.counter,
  signature: orders.protocol_data.signature,
  conduitKey: orders.protocol_data.parameters.conduitKey,
};

let considerationItemsTuple = [];
let considerationsArr = orders.protocol_data.parameters.consideration;
for (let i = 0; i < considerationsArr.length; i++) {
  let newConsideration = {
    token: orders.protocol_data.parameters.consideration[i].token,
    itemType: orders.protocol_data.parameters.consideration[i].itemType,
    identifierOrCriteria: orders.protocol_data.parameters.consideration[i].identifierOrCriteria,
    startAmount: orders.protocol_data.parameters.consideration[i].startAmount,
    endAmount: orders.protocol_data.parameters.consideration[i].endAmount,
    recipient: orders.protocol_data.parameters.consideration[i].recipient
  }
  parameters.considerations.push(newConsideration);
  considerationItemsTuple.push([newConsideration.itemType, parameters.considerations[i].token, parameters.considerations[i].identifierOrCriteria, parameters.considerations[i].startAmount, parameters.considerations[i].endAmount, parameters.considerations[i].recipient])
}

console.log(considerationItemsTuple)

const ISeaportContract = new ethers.utils.Interface(seaportAbi);
console.log(ISeaportContract)

// fulfillAdvanced Order
const encodedParams = abi.encode(
  ["tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters", "uint120 numerator", "uint120 denominator", "bytes signature", "bytes extraData"],
  [ [parameters.offerer, parameters.zone, [[2, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.counter], 1, 1, parameters.signature, zeroHash] 
);
console.log(encodedParams);

async function newOrder() {
  // const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
  const baseFee = 0.015;
  const basePlusTrigger = Number('1.0') + Number('0.015');
  // console.log(ethers.utils.parseEther(basePlusTrigger.toString()));
  // const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);

  // const tinyfrensContract = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8"

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: NetworkSDK.Goerli,
  });

  const asset = await openseaSDK.api.getOrder({
    assetContractAddress: "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b",
    side: 'ask',
    tokenId: '1047792',
  })

  console.log(asset);
  // console.log(asset);

  const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  const triggerPrice = Number(document.getElementById('max-buy-price').value) + baseFee
  const purchasePrice = ethers.utils.parseEther(triggerPrice.toString());
  console.log(purchasePrice);
  // setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract, provider} );

  // const order = await openseaSDK.api.getOrder({
  //   side: 'ask',
  //   assetContractAddress: tinyfrensContract,
  //   tokenId: '4',
  // })
  // console.log(o);
  

  // Only needed with WETH
  // if(await checkApproval(signer, traderContract)) {
    // const nftCollectionAddress = document.getElementById('nft-contract-address').value;
    // const triggerPrice = Number(document.getElementById('max-buy-price').value) + baseFee
    // const purchasePrice = ethers.utils.parseEther(triggerPrice);
    // setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract, provider} );
  // } else {
    // -- later on I can update something to pop up on the front end --
    // console.log(`Must approve use of tokens first`);
  // }
}

async function _revokeApproval() {
  // const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);

  revokeApproval(signer, traderContract);
}

async function _approveAddress() {
  // const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);

  approveAddress(signer, traderContract);
}

document.getElementById('create-order').addEventListener('click', newOrder);
document.getElementById('approve-account').addEventListener('click', _approveAddress); 
document.getElementById('revoke-approval').addEventListener('click', _revokeApproval);


