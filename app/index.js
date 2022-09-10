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
  considerationToken: orders[0].protocol_data.parameters.consideration[0].token,
  considerationIdentifier: orders[0].protocol_data.parameters.consideration[0].identifierOrCriteria,
  considerationAmount: orders[0].protocol_data.parameters.consideration[0].startAmount + orders[0].protocol_data.parameters.consideration[1].startAmount,
  offerer: orders[0].protocol_data.parameters.offerer,
  zone: orders[0].protocol_data.parameters.zone,
  offerToken: orders[0].protocol_data.parameters.offer[0].token,
  offerIdentifier: parseFloat(orders[0].protocol_data.parameters.offer[0].identifierOrCriteria),
  offerAmount: parseFloat(orders[0].protocol_data.parameters.offer[0].startAmount),
  basicOrderType: orders[0].protocol_data.parameters.orderType,
  startTime: orders[0].listing_time,
  endTime: orders[0].expiration_time,
  zoneHash: orders[0].protocol_data.parameters.zoneHash,
  salt: orders[0].protocol_data.parameters.salt,
  signature: orders[0].protocol_data.signature
};

const encodeParams = abi.encode(
  ["tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients,uint8[] additionalRecipients, bytes signature)"],
  [ [parameters.considerationToken, parameters.considerationIdentifier, parameters.considerationAmount, parameters.offerer, parameters.zone, parameters.offerToken, parameters.offerIdentifier, parameters.offerAmount, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, zeroHash, zeroHash, 0, [], parameters.signature] ]
);

console.log(encodeParams);

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
    setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract} );
  } else {
    console.log(`Must approve use of tokens first`);
  }

  // With ETH
  console.log(`Submitting Order`);
  const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value, 'wei');
  setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract} );
  
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


