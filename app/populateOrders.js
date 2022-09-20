import UrNFTraderJSON from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import { ethers } from "ethers";
import buildOrder from './buyOrder';

export default async function populateOrders() {
  const userAddress = ethereum.selectedAddress;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, provider);
  const code = await provider.getCode(urNFTraderAddress);
  const orders = [];
  const currentUser = ethereum.selectedAddress;
  // const buyOrderBook = await urNFTrader.buyOrderBook(userAddress, 0);
  // const buyOrderBook2 = await urNFTrader.buyOrderBook(userAddress, 1);
  if (code != "0x") {
    const orderIds = Number(await urNFTrader.totalOrders(currentUser))
    for (let i = 0; i < orderIds; i++) {
      const orderId = i;
      const attributes = await urNFTrader.buyOrderBook(userAddress, orderId);
      orders.push({orderId, attributes});
    }
  }
  renderOrders(provider, urNFTrader, orders);
}

function renderOrders(provider, urNFTrader, orders) {
  const container = document.getElementById("container");
  container.innerHTML = orders.map(buildOrder).join("");
  orders.forEach( ({ orderId, attributes }) => {
    const { orderStatus } = attributes;
    if (orderStatus == 1) {
      document.getElementById(`cancel-${orderId}`).addEventListener('click', async () => {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        await urNFTrader.connect(signer).cancelOrderToBuy(orderId);
      })
    } else if (orderStatus == 2) {
      console.log('Order was executed');
    } 
  });
}