import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
const { OpenSeaSDK, Network: NetworkSDK } = require("opensea-js")
import { WebSocket } from 'ws';
import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import UrNFTraderJSON from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
import {urNFTraderAddress} from "./__config.json";
import executeOrder from "./executeOrder.js";
const options = {method: 'GET'};
require('dotenv').config();
const apiUrl = process.env.GOERLI_API_URL;


const client = new OpenSeaStreamClient({
  network: Network.TESTNET,
  connectOptions: {
    transport: WebSocket
  }
});



export default async function listenForListing(orderInfo) {
  let collectionSlug;
  const {userAddress, collectionAddress, orderId} = orderInfo
  const provider = new ethers.providers.Web3Provider(ethereum);

  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, provider);

  const orderStruct = await urNFTrader.buyOrderBook(userAddress, orderId.toString());
  console.log(orderStruct);
  const triggerPrice = orderStruct.triggerPrice.toString();


  // const tinyfrensContract = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8"

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: NetworkSDK.Goerli,
  });

  let { assets } = await openseaSDK.api.getAssets({
    asset_contract_address: collectionAddress,
    limit: 1
  })

  collectionSlug = assets[0].collection.slug;
  console.log(collectionSlug);
  
  // I also need to pass the tokenId of the NFT that bases the requirement
  // -- OPENSEA NEEDS TO UPDATE THE STREAM CLIENT TO USE GOERLI FOR THIS TO WORK -- 
  client.onItemListed(collectionSlug, (event) => {
    console.log("-- caught item listed --")
    let newFloorPrice = BigInt(event.payload.base_price);
    let paymentToken = event.payload.payment_token.address;
    let ethAddress = "0x0000000000000000000000000000000000000000";
   
    console.log(event);
    if (newFloorPrice <= BigInt(triggerPrice) && ethAddress == paymentToken) {
      console.log('-- trigger price met --');
      let nftIdParts = event.payload.item.nft_id.split('/');
      let tokenId = nftIdParts[nftIdParts.length - 1];
      let priceToTriggerDifference = BigInt(triggerPrice) - newFloorPrice;
      let priceToTriggerDifferenceStr = priceToTriggerDifference.toString();
      executeOrder(orderInfo, event, tokenId, client);
    } else {
      console.log('floor price does not meet threshold or payment token is not in ETH');
    }
  });

    // get collection slug
  // fetch(`https://testnets-api.opensea.io/api/v1/asset_contract/${collectionAddress}`, options)
  // .then(response => response.json())
  // .then(response => {
  //   console.log(response);
  //   collectionSlug = response.collection.slug;
  //   console.log(collectionSlug);
  // })
  // .catch(err => console.error(err));
  


  // const collectionContract = await fetch(`https://testnets-api.opensea.io/api/v1/asset_contract/${collectionAddress}`, options)
  // .then(response => response.json())
  // .then(response =>  {
  //   return response
  // })
  // .catch(err => console.error(err));

  // console.log(collectionContract);

  // const collection = await fetch(`https://testnets-api.opensea.io/api/v1/collection/${collectionContract.collection.slug}`, options)
  //   .then(response => response.json())
  //   .then(response =>  {
  //     return response
  //   })
  //   .catch(err => console.error(err));

  // console.log( await collection);
}

  /* -- HOW TO GET TOKENID -- 
  - on event (from below) there is a nft_id (that isn't in the fucking documentation) that returns the value for "nftId" thats below.
  - just split it by /, and the tokenId will always be at the end. 
  const nftId = "rinkeby/0x874b81b49c6c2a2a939ac354d6c1f1dc20f8580d/5";

  const nftIdParts = nftId.split('/');
  const tokenId = nftIdParts[nftIdParts.length - 1];
  console.log(tokenId);
  */