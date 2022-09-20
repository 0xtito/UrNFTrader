import populateOrders from "./populateOrders";
import populateInfo from "./populateInfo";
import listenForListing from './listenForListing'
import UrNFTraderJSON from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import { ethers } from "ethers";

export default async function setupEvents() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner();
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, provider);

  populateOrders();
  populateInfo();


  const code = await provider.getCode(urNFTraderAddress);
  if (code != '0x') {
    urNFTrader.on("SubmittedNewBuyOrder", (userAddress, collectionAddress, orderId) => {
      console.log('inside event handler SubmittedNewBuyOrder')
      // console.log(userAddress, collectionAddress, orderId);
      // populateOrders(userAddress, collectionAddress, orderId);
      listenForListing({userAddress, collectionAddress, orderId});
      populateOrders();
      populateInfo();
    });
    urNFTrader.on("CanceledBuyOrder", () => {
      console.log('order was canceled');
      populateOrders();
      populateInfo();
    });
    urNFTrader.on("EligibleForRefund", () => {
      populateInfo();
    });
    urNFTrader.on("ExecutedBuyOrder", () => {
      console.log('VICTORY!!!');
      populateOrders();
      populateInfo();
    })
  }
}

ethereum.on('chainChanged', () => {
  window.location.reload();
})

ethereum.on('accountsChanged', () => {
  window.location.reload();
})