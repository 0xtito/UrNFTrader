import UrNFTraderJSON from "./artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json";
import {urNFTraderAddress} from "./__config.json";
import { ethers } from "ethers";
import "./orderInfo.css";

export default async function populateInfo() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  let currentUser;
  let balance = "";
  let totalPendingOrders = 0;
  let totalExecutedOrders = 0;
  let totalCanceledOrders = 0;
  const code = await provider.getCode(urNFTraderAddress);
  if(code != "0x") {
    const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, signer);
    currentUser = ethereum.selectedAddress;

    balance = await provider.getBalance(currentUser);;
    const orderIds = Number(await urNFTrader.totalOrders(currentUser));
    for (let i = 0; i < orderIds; i++) {
      const { orderStatus } = await urNFTrader.getBuyOrder(currentUser, i);
      if (orderStatus == 1) totalPendingOrders++;
      if (orderStatus == 2) totalExecutedOrders++;
      if (orderStatus == 3) totalCanceledOrders++;
    }

  }
  document.getElementById("current-user").innerHTML = currentUser;
  document.getElementById("balance").innerHTML = ethers.utils.formatEther(balance);
  document.getElementById("pending-orders").innerHTML = totalPendingOrders;
  document.getElementById("executed-orders").innerHTML = totalExecutedOrders;
  document.getElementById('canceled-orders').innerHTML = totalCanceledOrders;
}