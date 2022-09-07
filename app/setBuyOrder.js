import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"
import { ethers } from 'ethers';
import listenForListing from './listenForListing'

// tinyfrens contract address: 0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D
// let signer, contract;
let num = 0



export default async function setBuyOrder(nftCollectionAddress, purchasePrice, contractInfo ) {
  const { signer, traderContract } = contractInfo;
  const signerAddress = await signer.getAddress();
  // const traderContractAddress = await traderContract.address;
  // const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  // console.log(await contract.buyOrderBook(signerAddress, 0))
  console.log(purchasePrice);
  console.log(await purchasePrice.toString())
  console.log(ethers.utils.parseUnits('50', 'gwei'));
  const tx = await traderContract.setPriceToBuy(nftCollectionAddress, {from: signerAddress,  gasLimit: '252667', value: purchasePrice });
  const receipt = await tx.wait();
  console.log(receipt)
  
  traderContract.once('submittedNewBuyOrder', (userAddress, collectionAddress, orderId, triggerPrice) => {
    console.log('new buy order added');
    console.log({ userAddress, collectionAddress, orderId, triggerPrice });
    listenForListing( { userAddress, collectionAddress, orderId, triggerPrice }, contractInfo);
  });

}

