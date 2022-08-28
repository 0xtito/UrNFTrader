import { ethers } from 'ethers';
import WETH from './artifacts/contracts/WETHToken.sol/WETHToken.json';
import { WETHTokenAddress } from "./__config.json"

export default async function checkApproval(signer, UrNFTraderContract) {

  // const WETHcontractAdressRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const UrNFTraderContractAddress = await UrNFTraderContract.address;
  const signerAddress = await signer.getAddress();
  const WETHcontract = new ethers.Contract(WETHTokenAddress, WETH.abi, signer);

  if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) > (2^255)) {
    console.log(`contract is approved`);
    return true;
  } else {
    console.log(`contract is not approved`)
    return false;
  }
  
  WETHcontract.on('Approval', async () => {
    if (await WETHcontract.allowance(signerAddress, UrNFTraderContractAddress) != 0) {
      console.log(`Account ${signerAddress} approved the contract to spend it's WETH`);
      // await UrNFTraderContract.isApprovedERC20(signerAddress) = true;
    }
  });
}