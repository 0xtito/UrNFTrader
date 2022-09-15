import { ethers } from 'ethers';
// local WETH version
import  { abi }  from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"
// real WETH on Goerli
import WETHabi from "./JSON/WETHabi.json"

export default async function revokeApproval(signer, UrNFTraderContract) {

  const WETHcontractAddressGoerli = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
  const UrNFTraderContractAddress = await UrNFTraderContract.address;
  const signerAddress = await signer.getAddress();
  const WETHcontract = new ethers.Contract(WETHTokenAddress, abi, signer);
  const WETHcontractGoerli = new ethers.Contract(WETHcontractAddressGoerli, WETHabi, signer);


  if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) < 257) {
    console.log(`No approval currently set`);
  } else {
    console.log(`Start Approval Revocation`);
    const currentAllowance = await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress);

    const result = await WETHcontract.decreaseAllowance(UrNFTraderContractAddress, currentAllowance, {
      from: signerAddress,
    });
    const receipt = await result.wait();
    console.log('receipt', await receipt);
  }
  
  WETHcontract.once('Approval', async () => {
    if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) == 0) {
      console.log(`Account ${signerAddress} has revoked allowance from ${UrNFTraderContractAddress}`);
    };
  });
}