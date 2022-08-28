import { ethers } from "ethers";
import MyNFTrader from "./artifacts/contracts/MyNFTrader.sol/MyNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import checkApproval from "./checkApproval";
import revokeApproval from "./revokeApproval";
import approveAddress from './approveAddress';
import setBuyOrder from "./setBuyOrder";

import "./index.css"


async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const contract = new ethers.Contract(urNFTraderAddress, MyNFTrader.abi, signer);

  if(await checkApproval(signer, contract)) {
    const nftCollectionAddress = document.getElementById('nft-contract-address').value;
    const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value, 'wei');
    setBuyOrder(nftCollectionAddress, purchasePrice, {signer, contract} );
  } else {
    console.log(`Must approve use of tokens first`);
  }
}

async function _revokeApproval() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const contract = new ethers.Contract(urNFTraderAddress, MyNFTrader.abi, signer);

  await revokeApproval(signer, contract);
}

async function _approveAddress() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner(0);
  const contract = new ethers.Contract(urNFTraderAddress, MyNFTrader.abi, signer);

  await approveAddress(signer, contract);
}

document.getElementById('create-order').addEventListener('click', newOrder);
document.getElementById('approve-account').addEventListener('click', _approveAddress);
document.getElementById('revoke-approval').addEventListener('click', _revokeApproval)

/*
TODO:
  have the user approve the contract to use their ether on the FRONT END
  

*/

