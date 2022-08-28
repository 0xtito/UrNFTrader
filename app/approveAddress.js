import { ethers } from 'ethers';
import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"

export default async function approveAddress(signer, mainContract) {
  const UrNFTraderContractAddress = await mainContract.address;
  const signerAddress = await signer.getAddress();
  const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) != 0) {
    console.log('already approved')
  } else {
    const result = (await WETHcontract.approve(UrNFTraderContractAddress, (2^256)-1, {
      from: signerAddress,
    })).wait();
    console.log(await result);
  }

  WETHcontract.on('Approval', async () => {
    if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) != 0) {
      console.log(`Account ${signerAddress} approved the contract to spend it's WETH`);
    }
  });
}