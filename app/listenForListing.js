import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
import { WebSocket } from 'ws';
import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import executeOrder from "./executeOrder.js";
// const options = {method: 'GET'};
// const sdk = require('api')('@opensea/v1.0#7dtmkl3ojw4vb');

const client = new OpenSeaStreamClient({
  network: Network.TESTNET,
  connectOptions: {
    transport: WebSocket
  }
});

export default async function listenForListing(orderInfo, contractInfo) {
  

  const triggerPrice = orderInfo.triggerPrice;

  console.log(triggerPrice)

  // 
  /* -- HOW TO GET TOKENID -- 
  - on event (from below) there is a nft_id (that isn't in the fucking documentation) that returns the value for "nftId" thats below.
  - just split it by /, and the tokenId will always be at the end. 
  const nftId = "rinkeby/0x874b81b49c6c2a2a939ac354d6c1f1dc20f8580d/5";

  const nftIdParts = nftId.split('/');
  const tokenId = nftIdParts[nftIdParts.length - 1];
  console.log(tokenId);
  */
  
  // I also need to pass the tokenId of the NFT that bases the requirement
  client.onItemListed("tinyfrens-v2", (event) => {
    let newFloorPrice = event.payload.base_price;
    console.log(event);
    if (newFloorPrice <= triggerPrice) {
      executeOrder(orderInfo, contractInfo, event);
    }
  });


  // sdk.retrievingASingleContractTestnets({asset_contract_address: collectionAddress})
  // .then(res => console.log(res))
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