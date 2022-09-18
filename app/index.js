import { ethers } from "ethers";
import UrNFTrader from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import checkApproval from "./checkApproval";
import revokeApproval from "./revokeApproval";
import approveAddress from './approveAddress';
import setBuyOrder from "./setBuyOrder";
import seaportAbi from "../app/JSON/Seaport.json"
import {orders} from '../orderObject.json'
import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
const { OpenSeaSDK, Network: NetworkSDK } = require("opensea-js")
require("dotenv").config()
import "./index.css"

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
const options = {method: 'GET', headers: {accept: 'application/json'}};
const provider = new ethers.providers.Web3Provider(ethereum);


const client = new OpenSeaStreamClient({
  network: Network.TESTNET,
  connectOptions: {
    transport: WebSocket
  }
});
const unscubscribe = client.onItemListed('tinyfrens-v2-1');

client.onItemListed('tinyfrens-v2-1', (event) => {
  console.log(event);
})

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


