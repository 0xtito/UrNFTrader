import { ethers } from 'ethers';
import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"

export default async function revokeApproval(signer, UrNFTraderContract) {

  // const WETHcontractAdressRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const UrNFTraderContractAddress = await UrNFTraderContract.address;
  const signerAddress = await signer.getAddress();
  const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) < 257) {
    console.log(`No approval currently set`)
    return true;
  } else {
    console.log(`is approved`)

    const currentAllowance = await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress);

    const result = await WETHcontract.decreaseAllowance(UrNFTraderContractAddress, currentAllowance, {
      from: signerAddress,
    });
    const receipt = await result.wait();
    console.log('receipt', await receipt);
    // console.log('New allowance is:', (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress)).toString());
  }
  
  WETHcontract.once('Approval', async () => {
    if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) == 0) {
      console.log(`Account ${signerAddress} has revoked allowance from ${UrNFTraderContractAddress}`);
    };
  });
}