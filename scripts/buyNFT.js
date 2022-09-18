const { expect } = require('chai');
// const { ethers, network } = require('hardhat');
const {ethers} = require('ethers');
const { abi: tinyfrensABI} = require('../NftContract/Tinyfrens.json');
const { urNFTraderAddress, WETHTokenAddress, multicallAddress } = require('../app/__config.json');
const urNFTraderJSON = require("../app/artifacts/contracts/UrNFTrader.sol/UrNFTrader.json")
const { ethErrors } = require('eth-rpc-errors');
const { OpenSeaSDK, Network } = require("opensea-js")
require('dotenv').config();

const tinyfrensContractAddress = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8";
const ownerAddressHard = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const privKeyMain = process.env.PRIVATE_KEY;
const privKey2 = process.env.PRIVATE_KEY2;
const privKey3 = process.env.PRIVATE_KEY3
const apiUrl = process.env.GOERLI_API_URL;
const apiKey = process.env.GOERLI_API_KEY;
const testAccount2Hard = "0xc53bf942c381A14036675502Ae69A54595f9c2A8";
const testAccount3Hard = "0x446D078afc01D63D4BB41Da179072954EC3F5719";
const testTriggerPrice = ethers.utils.parseEther("0.4")
const maxApprovalValue = BigInt(((2**256) - 1) /(10**18));
const testTriggerPriceAndFee = BigInt(110000000000000000);
const baseFee = ethers.utils.parseEther('0.015');
// const provider = ethers.provider;
const provider = new ethers.providers.AlchemyProvider('goerli',apiKey);
// const provider1 = new ethers.providers.JsonRpcProvider(apiUrl);
// console.log(provider);
const owner = new ethers.Wallet(privKeyMain, provider);


// console.log(openseaSDK);

async function main() {
  // const urNFTrader = await ethers.getContractAt(urNFTraderJSON.abi, urNFTraderAddress);
  console.log(await owner.getBalance());

  // const response.error = ethErrors.rpc.server({
  //   code: -32603
  // })

  const openseaSDK = new OpenSeaSDK(provider, {
    networkName: Network.Goerli,
  });
  console.log(openseaSDK);
  const urNFTrader = new ethers.ContractFactory(urNFTraderJSON.abi,urNFTraderJSON.bytecode,owner);
  console.log(urNFTrader);

  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: tinyfrensContractAddress,
    tokenId: '5'
  });
  // console.log(order)
  // const purchasePrice = order.currentPrice;
  // const tokenId = order.protocolData.parameters.offer[0].identifierOrCriteria;
  // let abi = ethers.utils.defaultAbiCoder;
  // parameters = {
  //   considerations: [],
  //   offerer: order.protocolData.parameters.offerer,
  //   zone: order.protocolData.parameters.zone,
  //   offerToken: order.protocolData.parameters.offer[0].token,
  //   offerItemType: order.protocolData.parameters.offer[0].itemType,
  //   offerIdentifier: order.protocolData.parameters.offer[0].identifierOrCriteria,
  //   offerStartAmount: order.protocolData.parameters.offer[0].startAmount,
  //   offerEndAmount: order.protocolData.parameters.offer[0].endAmount,
  //   basicOrderType: order.protocolData.parameters.orderType,
  //   startTime: order.listingTime,
  //   endTime: order.expirationTime,
  //   zoneHash: order.protocolData.parameters.zoneHash,
  //   salt: order.protocolData.parameters.salt,
  //   counter: order.protocolData.parameters.counter,
  //   signature: order.protocolData.signature,
  //   conduitKey: order.protocolData.parameters.conduitKey,
  //   totalOriginalConsiderationItems: order.protocolData.parameters.totalOriginalConsiderationItems,
  // };
  
  // let considerationItemsTuple = [];
  // let considerationsArr = order.protocolData.parameters.consideration;
  // for (let i = 0; i < considerationsArr.length; i++) {
  //   let newConsideration = {
  //     token: order.protocolData.parameters.consideration[i].token,
  //     itemType: order.protocolData.parameters.consideration[i].itemType,
  //     identifierOrCriteria: order.protocolData.parameters.consideration[i].identifierOrCriteria,
  //     startAmount: order.protocolData.parameters.consideration[i].startAmount,
  //     endAmount: order.protocolData.parameters.consideration[i].endAmount,
  //     recipient: order.protocolData.parameters.consideration[i].recipient
  //   }
  //   // purchasePrice will only apply to not 
  //   parameters.considerations.push(newConsideration);
  //   considerationItemsTuple.push([newConsideration.itemType, newConsideration.token, newConsideration.identifierOrCriteria, newConsideration.startAmount, newConsideration.endAmount, newConsideration.recipient])
  // }
  // // console.log(considerationItemsTuple)
  // // fulfillAdvanced Order
  // const encodedParams = abi.encode(
  //   ["tuple( tuple(address, address, tuple(uint8, address, uint256, uint256, uint256 endAmount)[], tuple(uint8, address, uint256, uint256, uint256, address)[], uint8, uint256, uint256, bytes32, uint256, bytes32, uint256), uint120, uint120, bytes, bytes)", "tuple(uint256, uint8, uint256, uint256, bytes32[])[]", "bytes32", "address"],
  //   [ 
  //     [
  //       [parameters.offerer, parameters.zone, [[parameters.offerItemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.totalOriginalConsiderationItems
  //       ],
  //      1, 1, parameters.signature, zeroHash
  //     ],
  //   [], zeroHash, testAccount3Hard 
  // ]);

  // console.log(order);
  // console.log(encodedParams);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
  });


