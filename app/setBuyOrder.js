// local WETH version
// import {abi} from './artifacts/contracts/WETHToken.sol/WETHToken.json';
// Goerli WETH abi
// import { WETHabi } from "./JSON/WETHabi.json";
// import { WETHTokenAddress } from "./__config.json"
// import { ethers } from 'ethers';
// import { WETHaddressGoerli } from './JSON/addresses.json';
import listenForListing from './listenForListing'

// tinyfrens contract address: 0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8
// let signer, contract;




export default async function setBuyOrder(nftCollectionAddress, purchasePrice, contractInfo ) {
  const { traderContract } = contractInfo;

  const tx = await traderContract.setPriceToBuy(purchasePrice, nftCollectionAddress);
  const receipt = await tx.wait();
  console.log(receipt)
  
  traderContract.once('submittedNewBuyOrder', (userAddress, collectionAddress, orderId, triggerPrice) => {
    console.log('new buy order added');
    console.log({ userAddress, collectionAddress, orderId, triggerPrice });
    listenForListing( { userAddress, collectionAddress, orderId, triggerPrice }, contractInfo);
  });

}

