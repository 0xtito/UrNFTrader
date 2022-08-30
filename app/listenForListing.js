import { OpenSeaStreamClient, Network } from '@opensea/stream-js';
import { WebSocket } from 'ws';

const client = new OpenSeaStreamClient({
  network: Network.TESTNET,
  connectOptions: {
    transport: WebSocket
  }
});

export default async function listenForLising(user, collectionAddress, triggerPrice) {


}