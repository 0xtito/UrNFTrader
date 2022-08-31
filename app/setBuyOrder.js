import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"
import { ethers } from 'ethers';
import listenForListing from './listenForListing'

// test nft collection: 0xfB7e002151343efA2a3A5f2EA98Db0D21efB75Ce
// let signer, contract;
let num = 0

export default async function setBuyOrder(nftCollectionAddress, purchasePrice, contractInfo ) {
  const { signer, contract } = contractInfo;
  const signerAddress = await signer.getAddress();
  const mainContractAddress = await contract.address;
  const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  // console.log(await contract.buyOrderBook(signerAddress, 0))

  const tx = await contract.setPriceToBuy(purchasePrice, nftCollectionAddress);
  
    contract.once('submittedNewBuyOrder', (user, collectionAddress, orderID, triggerPrice) => {
      console.log('new buy order added');
      console.log(num)
      num = 1;
      console.log(triggerPrice);
      console.log({ user, collectionAddress, triggerPrice });
      listenForListing(user, collectionAddress, triggerPrice);
    });

}

