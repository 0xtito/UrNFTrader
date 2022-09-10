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
const privKey = process.env.PRIVATE_KEY;
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


// const { executeAllActions } = await seaport.createOrder();
// await executeAllActions;
// const { executeAllActions: executeAllFulfillActions } = await seaport.fulfillOrder();

  /*
  fulfill order takes:
  fulfillOrder({ order, unitsToFill, offerCriteria, considerationCriteria, tips, extraData, accountAddress, conduitKey, recipientAddress, }: {
        order: OrderWithCounter;
        unitsToFill?: BigNumberish;
        offerCriteria?: InputCriteria[];
        considerationCriteria?: InputCriteria[];
        tips?: TipInputItem[];
        extraData?: string;
        accountAddress?: string;
        conduitKey?: string;
        recipientAddress?: string;
    }): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillBasicOrder" | "fulfillOrder" | "fulfillAdvancedOrder">>>>;

  export declare type OrderWithCounter = {
    parameters: OrderComponents;
    signature: string;
  };
  which is essentially OrderParameters, counter, signature
  with the orderComponents being:
  export declare type OrderParameters = {
    offerer: string;
    zone: string;
    orderType: OrderType;
    startTime: BigNumberish;
    endTime: BigNumberish;
    zoneHash: string;
    salt: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    totalOriginalConsiderationItems: BigNumberish;
    conduitKey: string;
};
export declare type OrderComponents = OrderParameters & {
    counter: number;
};
type OfferItem = {
    itemType: ItemType;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
}
type ConsiderationItem = {
    itemType: ItemType;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
    recipient: string;
}
  */


export default async function executeOrder(orderInfo, contractInfo, orderEvent, tokenId) {

  const options = {method: 'GET', headers: {Accept: 'application/json'}};
  const { userAddress, collectionAddress, orderId, triggerPrice } = orderInfo;
  const { signer, traderContract } = contractInfo
  const offererAddress = orderEvent.maker.address;
  const listedTimeInSeconds = new Date(orderEvent.payload.listing_date).getTime()/1000;
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"
  // const zeroHash = '0x0'

  const ItraderContract = new ethers.utils.Interface(UrNFTrader.abi);
  const abi = ethers.utils.defaultAbiCoder;



  let order = await getResponse();
  let success;

  let parameters = {
    considerationToken: orders[0].protocol_data.parameters.consideration[0].token,
    considerationIdentifier: orders[0].protocol_data.parameters.consideration[0].identifierOrCriteria,
    considerationAmount: orders[0].protocol_data.parameters.consideration[0].startAmount + orders[0].protocol_data.parameters.consideration[1].startAmount,
    offerer: orders[0].protocol_data.parameters.offerer,
    zone: orders[0].protocol_data.parameters.zone,
    offerToken: orders[0].protocol_data.parameters.offer[0].token,
    offerIdentifier: parseFloat(orders[0].protocol_data.parameters.offer[0].identifierOrCriteria),
    offerAmount: parseFloat(orders[0].protocol_data.parameters.offer[0].startAmount),
    basicOrderType: orders[0].protocol_data.parameters.orderType,
    startTime: orders[0].listing_time,
    endTime: orders[0].expiration_time,
    zoneHash: orders[0].protocol_data.parameters.zoneHash,
    salt: orders[0].protocol_data.parameters.salt,
    signature: orders[0].protocol_data.signature
  };
  
  const encodedParams = abi.encode(
    ["tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients,uint8[] additionalRecipients, bytes signature)"],
    [ [parameters.considerationToken, parameters.considerationIdentifier, parameters.considerationAmount, parameters.offerer, parameters.zone, parameters.offerToken, parameters.offerIdentifier, parameters.offerAmount, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, zeroHash, zeroHash, 0, [], parameters.signature] ]
  );

  const values = [
    userAddress,
    orderId,
    tokenId,
    encodedParams
  ]

  const callExecuteOrderData = ItraderContract.encodeFunctionData("executeBuyOrder", [ values ]);

  const abiEncode = ethers.utils.defaultAbiCoder;
  const dataHex = abiEncode.encode()

  const txData = {

  };
    
  const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });

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




