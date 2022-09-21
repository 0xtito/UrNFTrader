import populateOrders from "./populateOrders";
import populateInfo from "./populateInfo";
import UrNFTraderJSON from "./artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json";
import {urNFTraderAddress} from "./__config.json";
import manageListeners from "./manageListeners";
import { ethers } from "ethers";

export default async function setupEvents() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = provider.getSigner();
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, provider);

  populateOrders();
  populateInfo();
  manageListeners(ethereum.selectedAddress);


  const code = await provider.getCode(urNFTraderAddress);
  if (code != '0x') {
    urNFTrader.on("SubmittedNewBuyOrder", (userAddress, collectionAddress, orderId) => {
      console.log('inside event handler SubmittedNewBuyOrder')
      populateOrders();
      populateInfo();
      manageListeners(userAddress)
    });
    urNFTrader.on("CanceledBuyOrder", (userAddress) => {
      console.log('order was canceled');
      populateOrders();
      populateInfo();
      manageListeners(userAddress);
    });
    urNFTrader.on("OwedLeftoverFunds", () => {
      populateInfo();
    });
    urNFTrader.on("ExecutedBuyOrder", (userAddress) => {
      console.log('VICTORY!!!');
      console.log(userAddress);
      populateOrders();
      populateInfo();
      manageListeners(userAddress);
    })
  }
}

ethereum.on('chainChanged', () => {
  window.location.reload();
})

ethereum.on('accountsChanged', () => {
  window.location.reload();
})