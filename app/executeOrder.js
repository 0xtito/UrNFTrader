import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import UrNFTrader from './artifacts/contracts/UrNFTrader.sol/UrNFTrader.json';
import { UniswapRouterArtifact } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import swapETH from './swapETH';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import {orders} from '../orderObject.json'
require('dotenv').config()

const rinkebyAPI = process.env.RINKEBY_API;
// Account 2
const privKey = process.env.PRIVATE_KEY2;
const common = new Common({ chain: Chain.Rinkeby, hardfork: Hardfork.London });

// const provider = new ethers.providers.Web3Provider(ethereum);
const provider = new ethers.providers.JsonRpcProvider(rinkebyAPI);
const seaport = new Seaport(provider);
const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// const uniswapABI = UniswapRouterArtifact.abi;
const WETHRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const WETHMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


  /* TODO:
    create the tx the moment the i recieve the data from seaport (using seaport and ethereumjs/tx)
    sign and send the transaction using my EOA (this is what makes it centralized)
  */

export default async function executeOrder(orderInfo, contractInfo, orderEvent, tokenId) {

  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  const { userAddress, collectionAddress, orderId, triggerPrice } = orderInfo;
  const { signer, traderContract } = contractInfo
  const offererAddress = orderEvent.maker.address;
  // const orders = orderEvent.orders[0];
  const listedTimeInSeconds = new Date(orderEvent.payload.listing_date).getTime()/1000;
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  // const zeroHash = '0x0'

  const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);
  const abi = ethers.utils.defaultAbiCoder;



  // let orders = orders;
  let success;


  // considerationToken1: orders.protocol_data.parameters.consideration[0].token,
  //   considerationItemType1: orders.protocol_data.parameters.consideration[0].itemType,
  //   considerationIdentifier1: orders.protocol_data.parameters.consideration[0].identifierOrCriteria,
  //   considerationStartAmount1: orders.protocol_data.parameters.consideration[0].startAmount,
  //   considerationEndAmount1: orders.protocol_data.parameters.consideration[1].endAmount,
  //   considerationToken2: orders.protocol_data.parameters.consideration[1].token,
  //   considerationItemType2: orders.protocol_data.parameters.consideration[1].itemType,
  //   considerationIdentifier2: orders.protocol_data.parameters.consideration[1].identifierOrCriteria,
  //   considerationStartAmount2: orders.protocol_data.parameters.consideration[1].startAmount,
  //   considerationEndAmount2: orders.protocol_data.parameters.consideration[1].endAmount,

  let parameters = {
    considerations: [],
    offerer: orders.protocol_data.parameters.offerer,
    zone: orders.protocol_data.parameters.zone,
    offerToken: orders.protocol_data.parameters.offer[0].token,
    offerIdentifier: parseFloat(orders.protocol_data.parameters.offer[0].identifierOrCriteria),
    offerStartAmount: parseFloat(orders.protocol_data.parameters.offer[0].startAmount),
    offerEndAmount: parseFloat(orders.protocol_data.parameters.offer[0].endAmount),
    basicOrderType: orders.protocol_data.parameters.orderType,
    startTime: orders.listing_time,
    endTime: orders.expiration_time,
    zoneHash: orders.protocol_data.parameters.zoneHash,
    salt: orders.protocol_data.parameters.salt,
    counter: orders.protocol_data.parameters.counter,
    signature: orders.protocol_data.signature,
    conduitKey: orders.protocol_data.parameters.conduitKey,
  };
  
  let considerationItemsTuple = [];
  let considerationsArr = orders.protocol_data.parameters.consideration;
  for (let i = 0; i < considerationsArr.length; i++) {
    let newConsideration = {
      token: orders.protocol_data.parameters.consideration[i].token,
      itemType: orders.protocol_data.parameters.consideration[i].itemType,
      identifierOrCriteria: orders.protocol_data.parameters.consideration[i].identifierOrCriteria,
      startAmount: orders.protocol_data.parameters.consideration[i].startAmount,
      endAmount: orders.protocol_data.parameters.consideration[i].endAmount,
      recipient: orders.protocol_data.parameters.consideration[i].recipient
    }
    parameters.considerations.push(newConsideration);
    considerationItemsTuple.push([newConsideration.itemType, parameters.considerations[i].token, parameters.considerations[i].identifierOrCriteria, parameters.considerations[i].startAmount, parameters.considerations[i].endAmount, parameters.considerations[i].recipient])
  }
  
  console.log(considerationItemsTuple)
  
  // fulfillAdvanced Order
  const encodedParams = abi.encode(
    ["tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters", "uint120 numerator", "uint120 denominator", "bytes signature", "bytes extraData"],
    [ [parameters.offerer, parameters.zone, [[2, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.counter], 1, 1, parameters.signature, zeroHash] 
  );
  // fulfillBasicOrder
  // const encodedParams = abi.encode(
  //   ["tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients,uint8[] additionalRecipients, bytes signature)"],
  //   [ [parameters.considerationToken, parameters.considerationIdentifier, parameters.considerationAmount, parameters.offerer, parameters.zone, parameters.offerToken, parameters.offerIdentifier, parameters.offerAmount, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, zeroHash, zeroHash, 0, [], parameters.signature] ]
  // );


  const values = [
    userAddress,
    orderId,
    tokenId,
    encodedParams
  ];

  const callExecuteOrderData = ItraderContract.encodeFunctionData("executeBuyOrder", [ values ]);

  const centralWallet = new ethers.Wallet(privKey,provider);
  const centralWalletAddress = await centralWallet.getAddress();

  const feeData = await provider.getFeeData();

  const tx = {
    from: centralWalletAddress,
    to: traderContract.address,
    data: callExecuteOrderData,
    gasPrice: feeData.gasPrice,
    nonce: await provider.getTransactionCount(centralWalletAddress)
  }
  tx.gasLimit = await provider.estimateGas(tx);
  console.log(tx)
  const signed = await centralWallet.signTransaction(tx);
  console.log(signed);
  const sendTx = await provider.sendTransaction(signed);
  console.log(sendTx);
  const receipt = await sendTx.wait();

  let events = receipt.logs.map( (log) => ItraderContract.parseLog(log));
  console.log(events);
  
}

async function getResponse(collectionAddress, tokenId) {
  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  const response = await fetch(
    `https://testnets-api.opensea.io/v2/orders/rinkeby/seaport/listings?asset_contract_address=${collectionAddress}&limit=1&token_ids=${tokenId}`, options);

  if (!response.ok) {
    throw new Error(`Failed to retrieve listing info: ${response.status}`);
  }
  const data = await response.json();
  return await data.orders[0];


}

async function sendOrderToSeaport(_userAddress, _orderId, _triggerPrice, _tokenId, parameters, traderContract) {
  const tx = await traderContract.executeBuyOrder(_userAddress, _orderId, _triggerPrice, _tokenId, parameters);
  const receipt = await tx.wait();
  console.log(`Receipt immediately after tx: ${receipt}`)

  traderContract.once('executedBuyOrder', (_user, _collectionAddress, _orderId) => {
    console.log('Order fufilled!');
    console.log(`Receipt after executedBuyOrder emmitted: ${receipt}`);
  })
}




