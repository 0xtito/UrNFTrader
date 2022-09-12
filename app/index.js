import { ethers } from "ethers";
import UrNFTrader from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import checkApproval from "./checkApproval";
import revokeApproval from "./revokeApproval";
import approveAddress from './approveAddress';
import setBuyOrder from "./setBuyOrder";
import {orders} from '../orderObject.json'
import "./index.css"
//test
// import createOrder from "./testSeaport/createOrder.mjs";
import executeOrder from "./executeOrder";
const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"




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

// fulfillAdvanced Order
const encodedParams = abi.encode(
  ["tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters", "uint120 numerator", "uint120 denominator", "bytes signature", "bytes extraData"],
  [ [parameters.offerer, parameters.zone, [[2, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.counter], 1, 1, parameters.signature, zeroHash] 
);
console.log(encodedParams);

async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
  const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);
  console.log(ItraderContract);
  
  // console.log(traderContract);

  // const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);
  // console.log(ItraderContract.getSighash("setPriceToBuy(address)"));


  // Only needed with WETH
  if(await checkApproval(signer, traderContract)) {
    const nftCollectionAddress = document.getElementById('nft-contract-address').value;
    const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value, 'wei');
    setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract, provider} );
  } else {
    console.log(`Must approve use of tokens first`);
  }

  // With ETH
  // console.log(`Submitting Order`);
  // const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  // const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value, 'wei');
  // setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract} );
  
}

async function _revokeApproval() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
  console.log(traderContract);
  revokeApproval(signer, traderContract);
}

async function _approveAddress() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);

  approveAddress(signer, traderContract);
}

document.getElementById('create-order').addEventListener('click', newOrder);
// Only needed when using WETH
document.getElementById('approve-account').addEventListener('click', _approveAddress); 
document.getElementById('revoke-approval').addEventListener('click', _revokeApproval);


