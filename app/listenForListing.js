import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
import { WebSocket } from 'ws';
const options = {method: 'GET'};
// const sdk = require('api')('@opensea/v1.0#7dtmkl3ojw4vb');

// let collection;
const client = new OpenSeaStreamClient({
  network: Network.TESTNET,
  connectOptions: {
    transport: WebSocket
  }
});

export default async function listenForListing(user, collectionAddress, triggerPrice) {


  // sdk.retrievingASingleContractTestnets({asset_contract_address: collectionAddress})
  // .then(res => console.log(res))
  // .catch(err => console.error(err));

  const collectionContract = await fetch(`https://testnets-api.opensea.io/api/v1/asset_contract/${collectionAddress}`, options)
  .then(response => response.json())
  .then(response =>  {
    return response
  })
  .catch(err => console.error(err));

  console.log(collectionContract);

  const collection = fetch(`https://testnets-api.opensea.io/api/v1/collection/${collectionContract.collection.slug}`, options)
    .then(response => response.json())
    .then(response =>  {
      return response
    })
    .catch(err => console.error(err));

  console.log( await collection);

}