import { ethers } from 'ethers';
import { urNFTraderAddress } from "./__config.json";
import UrNFTraderJSON from "./artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json";
const { OpenSeaSDK, Network } = require("opensea-js")
require('dotenv').config()
// Account 1
const privKey = process.env.PRIVATE_KEY;

export default async function executeOrder(orderInfo, tokenId) {
  const provider = new ethers.providers.Web3Provider(ethereum);
  // const provider = new ethers.providers.JsonRpcProvider(goerliAPIurl);
  const ownerWallet = new ethers.Wallet(privKey, provider);
  const { userAddress, collectionAddress, orderId } = orderInfo;
  const urNFTrader = new ethers.Contract(urNFTraderAddress, UrNFTraderJSON.abi, ownerWallet);
  const IUrNFTrader = new ethers.utils.Interface(UrNFTraderJSON.abi);
  const abi = ethers.utils.defaultAbiCoder;
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: Network.Goerli,
  });

  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: collectionAddress,
    tokenId: tokenId
  });
 
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

  const signed = await ownerWallet.signTransaction(tx);
  console.log(signed);
  console.log('next step - send tx');
  const sentTx = await provider.sendTransaction(signed)
  console.log('waiting...');
  const receipt = await sentTx.wait();
  console.log(receipt);
}