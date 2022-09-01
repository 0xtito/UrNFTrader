import { ethers } from "ethers";
import UrNFTrader from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import checkApproval from "./checkApproval";
import revokeApproval from "./revokeApproval";
import approveAddress from './approveAddress';
import setBuyOrder from "./setBuyOrder";
import "./index.css"
//test
// import createOrder from "./testSeaport/createOrder.mjs";

async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);

  if(await checkApproval(signer, traderContract)) {
    const nftCollectionAddress = document.getElementById('nft-contract-address').value;
    const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value, 'wei');
    setBuyOrder(nftCollectionAddress, purchasePrice, {signer, traderContract} );
  } else {
    console.log(`Must approve use of tokens first`);
  }
}

async function _revokeApproval() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);

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
document.getElementById('approve-account').addEventListener('click', _approveAddress);
document.getElementById('revoke-approval').addEventListener('click', _revokeApproval);


