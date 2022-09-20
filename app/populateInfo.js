import UrNFTraderJSON from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
// const urNFTraderAddress = "0x44CCeb9874Df3974d0D760aEa64B0b411a30F43E"
import { ethers } from "ethers";
import "./orderInfo.css";

export default async function populateInfo() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  let currentUser;
  let balance = "";
  let totalPendingOrders = 0;
  let totalExecutedOrders = 0;
  let totalCanceledOrders = 0;
  const code = await provider.getCode(urNFTraderAddress);
  if(code != "0x") {
    const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, provider);
    currentUser = ethereum.selectedAddress;

    balance = await provider.getBalance(currentUser);
    // totalPendingOrders = await urNFTrader.getOrderCount(currentUser, true);
    // totalExecutedOrders = await urNFTrader.getOrderCount(currentUser, false);
    const orderIds = Number(await urNFTrader.totalOrders(currentUser));
    for (let i = 0; i < orderIds; i++) {
      const { orderStatus } = await urNFTrader.buyOrderBook(currentUser,i);
      console.log(orderStatus)
      // TODO
      // EXECUTED ORDERS AREN'T CHANGING THEIR ORDER STATUS
      // THIS IS EITHER A PROBLEM IN JS OR IN THE CONTRACT ITSELF
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