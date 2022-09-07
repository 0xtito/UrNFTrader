import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import { UniswapRouterArtifact } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import swapETH from './swapETH';

const provider = new ethers.providers.Web3Provider(ethereum);
const seaport = new Seaport(provider);
const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// const uniswapABI = UniswapRouterArtifact.abi;
const WETHRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const WETHMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Only needed this to swap WETH to ETH
// const uniswap = new ethers.Contract(uniswapRouterAddress, uniswapABI, provider);

export default async function executeOrder(orderInfo, contractInfo, orderEvent, tokenId) {

  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  const { userAddress, collectionAddress, orderId, triggerPrice } = orderInfo;
  const { signer, traderContract } = contractInfo
  const offererAddress = orderEvent.maker.address;
  const listedTimeInSeconds = new Date(orderEvent.payload.listing_date).getTime()/1000; 
  let order;

  fetch('https://testnets-api.opensea.io/v2/orders/rinkeby/seaport/listings?asset_contract_address=0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D&limit=1&token_ids=5', options)
    .then(response => response.json())
    .then(response => {
      order = response.orders[0];
      console.log(`order:` + order);
    })
    .catch(err => console.error(err));

  const success = await swapETH(triggerPrice,true, traderContract);

  if (success) {
    const { executeAllActions: executeAllFulfillActions } = await seaport.fulfillOrder({
      order,
      accountAddress: traderContract.address,
    });
  
    const transaction = await executeAllFulfillActions(); 
    console.log(transaction);
  
    console.log('-- now send back WETH --')
  }


}




