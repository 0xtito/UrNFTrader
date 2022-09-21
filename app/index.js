import { ethers } from "ethers";
import UrNFTraderJSON from "./artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json";
import {urNFTraderAddress} from "./__config.json";
import setupEvents from "./setupEvents";
require("dotenv").config();
import "./index.css";

setupEvents();

async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner();
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, signer);
  const baseFee = await urNFTrader.baseFee();


  const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  const purchasePrice = ethers.utils.parseEther(document.getElementById('max-buy-price').value);
  const purchasePricePlusFee = purchasePrice.add(baseFee);
  await urNFTrader.connect(signer).setPriceToBuy(nftCollectionAddress, { value: purchasePricePlusFee});
}

document.getElementById('create-order').addEventListener('click', newOrder);



