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
import executeOrder from "./executeOrder";

async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const traderContract = new ethers.Contract(urNFTraderAddress, UrNFTrader.abi, signer);
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


