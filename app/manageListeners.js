import UrNFTraderJSON from "./artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json";
import {urNFTraderAddress} from "./__config.json";
import executeOrder from "./executeOrder";
import { ethers } from "ethers";
import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
const { OpenSeaSDK, Network: NetworkSDK } = require("opensea-js")
import { WebSocket } from 'ws';
require('dotenv').config();
const apiUrl = process.env.GOERLI_API_URL;
const privKey = process.env.PRIVATE_KEY;

export default async function manageListeners(userAddress) {
  const provider = new ethers.providers.Web3Provider(ethereum);
  // const provider = new ethers.providers.JsonRpcProvider(apiUrl);
  const ownerWallet = new ethers.Wallet(privKey, provider);
  // const signer = provider.getSigner();
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, ownerWallet);
  const totalOrders = Number(await urNFTrader.totalOrders(userAddress));
  const pendingOrders = [];
  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: NetworkSDK.Goerli,
  });

  // let { asset } = await openseaSDK.api.getAssets({
  //   asset_contract_address: collectionAddress,
  //   limit: 1
  // })

  let GETcount = 0;
  for (let i = 0; i < totalOrders; i++) {
    let asset;
    // const order = await urNFTrader.getBuyOrder(userAddress, i);
    const order = await urNFTrader.getBuyOrder(userAddress, i);
    if (GETcount < 4 && order.orderStatus == 1) {
      asset = await openseaSDK.api.getAssets({
        asset_contract_address: order.collectionAddress,
        limit: 1
      });
      GETcount++;
      if (GETcount == 4) {
        setTimeout( () => {
          console.log('waited a second & reset GETcount');
          GETcount = 0;
        }, 1000);
      }
    }

    if (order.orderStatus == 1) {
      const client = new OpenSeaStreamClient({
        network: Network.TESTNET,
        connectOptions: {
          transport: WebSocket
        }
      });
      pendingOrders.push({
        userAddress: userAddress,
        client: client,
        triggerPrice: order.triggerPrice,
        collectionAddress: order.collectionAddress,
        orderId: order.orderId,
        collectionSlug: asset.assets[0].collection.slug,
        isPending: true
      });
    }
  }

  for (let i = 0; i < pendingOrders.length; i++) {
    const currentOrder = pendingOrders[i];
    const thisListener = currentOrder.client.onItemListed(currentOrder.collectionSlug, (event) => {
      console.log("-- caught item listed --")
      let newFloorPrice = BigInt(event.payload.base_price);
      let paymentToken = event.payload.payment_token.address;
      let ethAddress = "0x0000000000000000000000000000000000000000";
      console.log(newFloorPrice);
      console.log(currentOrder.triggerPrice);
      console.log(event);
      if (newFloorPrice <= BigInt(currentOrder.triggerPrice) && ethAddress == paymentToken) {
        console.log('-- trigger price met --');
        let nftIdParts = event.payload.item.nft_id.split('/');
        let tokenId = nftIdParts[nftIdParts.length - 1];
        const collectionAddress = currentOrder.collectionAddress;
        const orderId = currentOrder.orderId;
        turnOffListener(currentOrder);
        executeOrder({userAddress, collectionAddress, orderId}, tokenId);
      } else {
        console.log('floor price does not meet threshold or payment token is not in ETH');
      }
    });
    currentOrder.listener = thisListener;
  }
}

function turnOffListener(currentOrder) {
  const listener = currentOrder.listener;
  // unsubscribes from event listener
  listener();
  currentOrder.isPending = false;
}