import { ethers } from 'ethers';
import UrNFTrader from './artifacts/contracts/UrNFTrader.sol/UrNFTrader.json';
import seaportAbi from "../app/JSON/Seaport.json";
import { urNFTraderAddress } from "./__config.json";
import UrNFTraderJSON from "./artifacts/contracts/UrNFTrader.sol/UrNFTrader.json";
// import swapETH from './swapETH';
import { Seaport } from '@opensea/seaport-js';
const { OpenSeaSDK, Network } = require("opensea-js")
// temp
import {orders as order} from '../orderObject.json'
require('dotenv').config()
const goerliAPIurl = process.env.GOERLI_API_URL;
// Account 1
const privKey = process.env.PRIVATE_KEY;
// const provider = new ethers.providers.Web3Provider(ethereum);
// const seaport = new Seaport(provider);




  /* TODO:
    create the tx the moment the i recieve the data from seaport (using seaport and ethereumjs/tx)
    sign and send the transaction using my EOA (this is what makes it centralized)
  */

export default async function executeOrder(orderInfo, orderEvent, tokenId, client) {
  // let orders;
  // PROVIDER NEEDS TO HAVE THE OWNER ATTACHED
  const provider = new ethers.providers.Web3Provider(ethereum);
  // const provider = new ethers.providers.JsonRpcProvider(goerliAPIurl);
  const ownerWallet = new ethers.Wallet(privKey, provider);

  // const { provider } = contractInfo;
  const { userAddress, collectionAddress, orderId } = orderInfo;
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, ownerWallet);
  const IUrNFTrader = new ethers.utils.Interface(UrNFTraderJSON.abi);
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
 
  console.log('js version of a enum in ts:')

  const abi = ethers.utils.defaultAbiCoder;


  const purchasePrice = order.currentPrice;

  const parameters = {
    considerations: [],
    offerer: order.protocolData.parameters.offerer,
    zone: order.protocolData.parameters.zone,
    offerToken: order.protocolData.parameters.offer[0].token,
    offerItemType: order.protocolData.parameters.offer[0].itemType,
    offerIdentifier: order.protocolData.parameters.offer[0].identifierOrCriteria,
    offerStartAmount: order.protocolData.parameters.offer[0].startAmount,
    offerEndAmount: order.protocolData.parameters.offer[0].endAmount,
    basicOrderType: order.protocolData.parameters.orderType,
    startTime: order.listingTime,
    endTime: order.expirationTime,
    zoneHash: order.protocolData.parameters.zoneHash,
    salt: order.protocolData.parameters.salt,
    counter: order.protocolData.parameters.counter,
    signature: order.protocolData.signature,
    conduitKey: order.protocolData.parameters.conduitKey,
    totalOriginalConsiderationItems: order.protocolData.parameters.totalOriginalConsiderationItems,
  };
  
  let considerationItemsTuple = [];
  let considerationsArr = order.protocolData.parameters.consideration;
  for (let i = 0; i < considerationsArr.length; i++) {
    let newConsideration = {
      token: order.protocolData.parameters.consideration[i].token,
      itemType: order.protocolData.parameters.consideration[i].itemType,
      identifierOrCriteria: order.protocolData.parameters.consideration[i].identifierOrCriteria,
      startAmount: order.protocolData.parameters.consideration[i].startAmount,
      endAmount: order.protocolData.parameters.consideration[i].endAmount,
      recipient: order.protocolData.parameters.consideration[i].recipient
    }
    // purchasePrice will only apply to not 
    parameters.considerations.push(newConsideration);
    considerationItemsTuple.push([newConsideration.itemType, newConsideration.token, newConsideration.identifierOrCriteria, newConsideration.startAmount, newConsideration.endAmount, newConsideration.recipient])
  }
  // console.log(considerationItemsTuple)
  // fulfillAdvanced Order
  encodedParams = abi.encode(
    ["tuple( tuple(address, address, tuple(uint8, address, uint256, uint256, uint256 endAmount)[], tuple(uint8, address, uint256, uint256, uint256, address)[], uint8, uint256, uint256, bytes32, uint256, bytes32, uint256), uint120, uint120, bytes, bytes)", "tuple(uint256, uint8, uint256, uint256, bytes32[])[]", "bytes32", "address"],
    [ 
      [
        [parameters.offerer, parameters.zone, [[parameters.offerItemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.totalOriginalConsiderationItems
        ],
        1, 1, parameters.signature, zeroHash
      ],
    [], zeroHash, userAddress 
  ] 
  );
  console.log(order);

  const encodedExecuteData = IUrNFTrader.encodeFunctionData("executeBuyOrder", [
    [userAddress, orderId, purchasePrice, tokenId], 
    encodedParams
  ]);
  console.log(encodedExecuteData);

  const feeData = await provider.getFeeData();

  const tx = {
    from: ownerWallet.address,
    to: urNFTraderAddress,
    gasPrice: feeData.gasPrice,
    data: encodedExecuteData,
    nonce: await provider.getTransactionCount(ownerWallet.address)
  }
  tx.gasLimit = await urNFTrader.estimateGas.executeBuyOrder([userAddress, orderId, purchasePrice, tokenId], encodedParams);
  console.log(tx);
  console.log('after gas limit')

  // const unsignedTx = await urNFTrader.connect(ownerWallet).populateTransaction.executeBuyOrder([userAddress, 0, purchasePrice, tokenId], encodedParams);
  // console.log(unsignedTx);

  const signed = await ownerWallet.signTransaction(tx);
  console.log(signed);
  console.log('next step - send tx');
  const sentTx = await provider.sendTransaction(signed)
  console.log('waiting...');
  const receipt = await sentTx.wait();
  console.log(receipt);
  
  // // const fulfilled = await urNFTrader.executeBuyOrder([userAddress, 0, purchasePrice, tokenId], encodedParams);
  // // console.log('waiting...');
  // // const receipt = await fulfilled.wait();
  // // const logs = receipt.logs.map( (log) => IUrNFTrader.parseLog(log));
  // // console.log(logs);

  // console.log('-- checking user address --');

  // const tinyFrensContract = new ethers.Contract(tinyfrensAddress, tinyfrensABI, provider );
  // console.log(await tinyFrensContract.balanceOf(userAddress))


  // let parameters = {
  //   considerations: [],
  //   offerer: order.protocolData.parameters.offerer,
  //   zone: order.protocolData.parameters.zone,
  //   offerToken: order.protocolData.parameters.offer[0].token,
  //   offerItemType: order.protocolData.parameters.offer[0].itemType,
  //   offerIdentifier: parseFloat(order.protocolData.parameters.offer[0].identifierOrCriteria),
  //   offerStartAmount: parseFloat(order.protocolData.parameters.offer[0].startAmount),
  //   offerEndAmount: parseFloat(order.protocolData.parameters.offer[0].endAmount),
  //   basicOrderType: order.protocolData.parameters.orderType,
  //   startTime: order.listingTime,
  //   endTime: order.expirationTime,
  //   zoneHash: order.protocolData.parameters.zoneHash,
  //   salt: order.protocolData.parameters.salt,
  //   counter: order.protocolData.parameters.counter,
  //   signature: order.protocolData.signature,
  //   conduitKey: order.protocolData.parameters.conduitKey,
  // };
  
  // let considerationItemsTuple = [];
  // let purchasePrice = 0;
  // let considerationsArr = order.protocolData.parameters.consideration;
  // for (let i = 0; i < considerationsArr.length; i++) {
  //   let newConsideration = {
  //     token: order.protocolData.parameters.consideration[i].token,
  //     itemType: order.protocolData.parameters.consideration[i].itemType,
  //     identifierOrCriteria: parseFloat(order.protocolData.parameters.consideration[i].identifierOrCriteria),
  //     startAmount: parseFloat(order.protocolData.parameters.consideration[i].startAmount),
  //     endAmount: parseFloat(order.protocolData.parameters.consideration[i].endAmount),
  //     recipient: order.protocolData.parameters.consideration[i].recipient
  //   }
  //   // purchasePrice will only apply to not 
  //   purchasePrice += newConsideration.startAmount;
  //   parameters.considerations.push(newConsideration);
  //   considerationItemsTuple.push([newConsideration.itemType, newConsideration.token, newConsideration.identifierOrCriteria, newConsideration.startAmount, newConsideration.endAmount, newConsideration.recipient])
  // }
  // console.log(considerationItemsTuple)
  // if (parameters.offerItemType != 2) {
  //   throw new Error('They are not offering an ERC721');
  // }
  // // fulfillAdvanced Order
  // const encodedParams = abi.encode(
  //   ["tuple( tuple(address offerer, address zone, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, tuple(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 counter) parameters, uint120 numerator, uint120 denominator, bytes signature, bytes extraData) advancedOrder", "tuple(uint256 orderIndex, uint8 side, uint256 index, uint256 identifier, bytes32[] criteriaProof)[] criteriaResolvers", "bytes32 fulfillerConduitKey", "address recipient"],
  //   [ 
  //     [
  //       [parameters.offerer, parameters.zone, [[itemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.counter
  //       ],
  //      1, 1, parameters.signature, zeroHash
  //     ],
  //   [], zeroHash, userAddress 
  // ] 
  // );
  // console.log(encodedParams);

  // struct ExtraOrderInfo {
  //   address user;
  //   uint orderId;
  //   uint purchasePrice;
  // }

  // const encodedFulFillAdvancedOrder = ISeaportContract.encodeFunctionData('fulfillAdvancedOrder', [encodedParams]);

  // const encodeExtraOrderInfo = abi.encode(["tuple(address uint, uint, uint)"], [
  //   [userAddress, orderId, triggerPrice, tokenId]
  // ]);

  // const values = [
  //   [userAddress, orderId, triggerPrice, tokenId],
  //   encodedParams
  // ];

  // const callExecuteOrderData = ItraderContract.encodeFunctionData("executeBuyOrder", [ values ]);


  // const feeData = await provider.getFeeData();

  // const tx = {
  //   from: centralWalletAddress,
  //   to: urNFTrader.address,
  //   data: callExecuteOrderData,
  //   gasPrice: feeData.gasPrice,
  //   nonce: await provider.getTransactionCount(centralWalletAddress)
  // }
  // tx.gasLimit = await provider.estimateGas(tx);
  // console.log(tx)
  // const signed = await ownerWallet.signTransaction(tx);
  // console.log(signed);
  // const sendTx = await provider.sendTransaction(signed);
  // console.log(sendTx);
  // const receipt = await sendTx.wait();

  // let events = receipt.logs.map( (log) => ItraderContract.parseLog(log));
  // console.log(events);

  // urNFTrader.once('executedBuyOrder', (userAddress, collectionAddress, _tokenIdOfPurchasedNft) => {
  //   client.disconnect()
  //   console.log('WE DID IT!!!!!')
  //   console.log({userAddress, collectionAddress, _tokenIdOfPurchasedNft});
  // })
  
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




