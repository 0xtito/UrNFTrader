const {ethers} = require('ethers');
const { urNFTraderAddress } = require('../app/__config.json');
const urNFTraderJSON = require("../app/artifacts/contracts/UrNFTraderV1.sol/UrNFTraderV1.json")
const { OpenSeaSDK, Network } = require("opensea-js")
require('dotenv').config();

const tinyfrensContractAddress = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8";
const privKeyMain = process.env.PRIVATE_KEY;
const apiUrl = process.env.GOERLI_API_URL;
// const infuraAPI = process.env.INFURA_GOERLI_APIURL;
const testAccount3Hard = "0x446D078afc01D63D4BB41Da179072954EC3F5719";
const baseFee = ethers.utils.parseEther('0.015');
const provider = new ethers.providers.JsonRpcBatchProvider(apiUrl)
console.log(provider);
const owner = new ethers.Wallet(privKeyMain, provider);

const openseaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Goerli,
});

/**
 * NOTE: Using a infura/alchemy api url with the OpenseaSDK seems to cause an error
 * Code: -32600
 * Message: invalid request method
 * raw request:
 * {
      "method": {
        "method": "eth_chainId",
        "params": [],
        "id": 1,
        "jsonrpc": "2.0"
      },
      "id": 46,
      "jsonrpc": "2.0"
    }

    If there are any idea's why this happens, please let me know at @tito_cda on Twitter!
 */


async function main() {
  const urNFTrader = await ethers.getContractAt(urNFTraderJSON.abi, urNFTraderAddress);

  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: tinyfrensContractAddress,
    tokenId: '1'
  });
  console.log(order)
  const purchasePrice = order.currentPrice;
  const tokenId = order.protocolData.parameters.offer[0].identifierOrCriteria;
  let abi = ethers.utils.defaultAbiCoder;
  parameters = {
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

  const encodedParams = abi.encode(
    ["tuple( tuple(address, address, tuple(uint8, address, uint256, uint256, uint256 endAmount)[], tuple(uint8, address, uint256, uint256, uint256, address)[], uint8, uint256, uint256, bytes32, uint256, bytes32, uint256), uint120, uint120, bytes, bytes)", "tuple(uint256, uint8, uint256, uint256, bytes32[])[]", "bytes32", "address"],
    [ 
      [
        [parameters.offerer, parameters.zone, [[parameters.offerItemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.totalOriginalConsiderationItems
        ],
       1, 1, parameters.signature, zeroHash
      ],
    [], zeroHash, testAccount3Hard 
  ]);

  console.log(order);
  console.log(encodedParams);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
  });


