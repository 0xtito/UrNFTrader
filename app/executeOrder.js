import { ethers } from 'ethers';
import UrNFTrader from './artifacts/contracts/UrNFTrader.sol/UrNFTrader.json';
import swapETH from './swapETH';
import { Seaport } from '@opensea/seaport-js';
const { OpenSeaSDK, Network } = require("opensea-js")
// temp
import {orders as order} from '../orderObject.json'
require('dotenv').config()
const goerliAPIurl = process.env.GOERLI_API_URL;
const WETHGoerli = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const WETHMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// Account 2
const privKey = process.env.PRIVATE_KEY2;
// const provider = new ethers.providers.Web3Provider(ethereum);
// const seaport = new Seaport(provider);




  /* TODO:
    create the tx the moment the i recieve the data from seaport (using seaport and ethereumjs/tx)
    sign and send the transaction using my EOA (this is what makes it centralized)
  */

export default async function executeOrder(orderInfo, contractInfo, orderEvent, purchasePriceArg, tokenId, client) {
  // let orders;

  const { provider } = contractInfo;
  const { userAddress, collectionAddress, orderId, triggerPrice } = orderInfo;
  const { signer, traderContract } = contractInfo
  const centralWallet = new ethers.Wallet(privKey,provider);
  const centralWalletAddress = await centralWallet.getAddress();
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: Network.Goerli,
  });


  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: collectionAddress,
    tokenId: tokenId
  });
  console.log(order);
  console.log('js version of a enum in ts:')
  console.log(order.protocolData.parameters.orderType);

  const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);
  const abi = ethers.utils.defaultAbiCoder;

  let parameters = {
    considerations: [],
    offerer: order.protocolData.parameters.offerer,
    zone: order.protocolData.parameters.zone,
    offerToken: order.protocolData.parameters.offer[0].token,
    offerItemType: order.protocolData.parameters.offer[0].itemType,
    offerIdentifier: parseFloat(order.protocolData.parameters.offer[0].identifierOrCriteria),
    offerStartAmount: parseFloat(order.protocolData.parameters.offer[0].startAmount),
    offerEndAmount: parseFloat(order.protocolData.parameters.offer[0].endAmount),
    basicOrderType: order.protocolData.parameters.orderType,
    startTime: order.listingTime,
    endTime: order.expirationTime,
    zoneHash: order.protocolData.parameters.zoneHash,
    salt: order.protocolData.parameters.salt,
    counter: order.protocolData.parameters.counter,
    signature: order.protocolData.signature,
    conduitKey: order.protocolData.parameters.conduitKey,
  };
  
  let considerationItemsTuple = [];
  let purchasePrice = 0;
  let considerationsArr = order.protocolData.parameters.consideration;
  for (let i = 0; i < considerationsArr.length; i++) {
    let newConsideration = {
      token: order.protocolData.parameters.consideration[i].token,
      itemType: order.protocolData.parameters.consideration[i].itemType,
      identifierOrCriteria: parseFloat(order.protocolData.parameters.consideration[i].identifierOrCriteria),
      startAmount: parseFloat(order.protocolData.parameters.consideration[i].startAmount),
      endAmount: parseFloat(order.protocolData.parameters.consideration[i].endAmount),
      recipient: order.protocolData.parameters.consideration[i].recipient
    }
    // purchasePrice will only apply to not 
    purchasePrice += newConsideration.startAmount;
    parameters.considerations.push(newConsideration);
    considerationItemsTuple.push([newConsideration.itemType, newConsideration.token, newConsideration.identifierOrCriteria, newConsideration.startAmount, newConsideration.endAmount, newConsideration.recipient])
  }
  console.log(considerationItemsTuple)
  if (parameters.offerItemType != 2) {
    throw new Error('They are not offering an ERC721');
  }
  // fulfillAdvanced Order
  const encodedParams = abi.encode(
    ["tuple( tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters, uint120 numerator, uint120 denominator, bytes signature, bytes extraData) advancedOrder", "tuple(uint256 orderIndex, uint8 side, uint256 index, uint256 identifier, bytes32[] criteriaProof)[] criteriaResolvers", "bytes32 fulfillerConduitKey", "address recipient"],
    [ 
      [
        [parameters.offerer, parameters.zone, [[itemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.counter
        ],
       1, 1, parameters.signature, zeroHash
      ],
    [], zeroHash, userAddress 
  ] 
  );
  console.log(encodedParams);

  const values = [
    userAddress,
    orderId,
    tokenId,
    purchasePriceArg,
    encodedParams
  ];

  const callExecuteOrderData = ItraderContract.encodeFunctionData("executeBuyOrder", [ values ]);


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

  traderContract.once('executedBuyOrder', (userAddress, collectionAddress, _tokenIdOfPurchasedNft) => {
    client.disconnect()
    console.log('WE DID IT!!!!!')
    console.log({userAddress, collectionAddress, _tokenIdOfPurchasedNft});
  })
  
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

// async function sendOrderToSeaport(_userAddress, _orderId, _triggerPrice, _tokenId, parameters, traderContract) {
//   const tx = await traderContract.executeBuyOrder(_userAddress, _orderId, _triggerPrice, _tokenId, parameters);
//   const receipt = await tx.wait();
//   console.log(`Receipt immediately after tx: ${receipt}`)

//   traderContract.once('executedBuyOrder', (_user, _collectionAddress, _orderId) => {
//     console.log('Order fufilled!');
//     console.log(`Receipt after executedBuyOrder emmitted: ${receipt}`);
//   })
// }

// fulfillBasicOrder
// const encodedParams = abi.encode(
//   ["tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients,uint8[] additionalRecipients, bytes signature)"],
//   [ [parameters.considerationToken, parameters.considerationIdentifier, parameters.considerationAmount, parameters.offerer, parameters.zone, parameters.offerToken, parameters.offerIdentifier, parameters.offerAmount, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, zeroHash, zeroHash, 0, [], parameters.signature] ]
// );




