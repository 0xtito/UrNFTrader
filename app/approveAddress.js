import { ethers } from 'ethers';
import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"

export default async function approveAddress(signer, mainContract) {
  const UrNFTraderContractAddress = await mainContract.address;
  const signerAddress = await signer.getAddress();
  const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) >= 257) {
    console.log('already approved')
  } else {
    const tx = (await WETHcontract.approve(UrNFTraderContractAddress, BigInt(((2**256) - 1) /(10**18))));
    const receipt = await tx.wait();
    console.log(receipt);
  }

  WETHcontract.once('Approval', async () => {
    if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) != 0) {
      console.log(`Account ${signerAddress} approved the contract to spend ${await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress)} WEI`);
    }
  });
}