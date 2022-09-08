import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import { UniswapRouterArtifact } from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import swapETH from './swapETH';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
require('dotenv').config()

const rinkebyAPI = process.env.RINKEBY_API;
const privKey2 = process.env.PRIVATE_KEY2;
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


  let order;
  let success;
  let parameters;

  fetch(`https://testnets-api.opensea.io/v2/orders/rinkeby/seaport/listings?asset_contract_address=${collectionAddress}&limit=1&token_ids=${tokenId}`, options)
    .then(response => response.json())
    .then(response => {
      order = response.orders[0];
      console.log(`order:` + order);
      parameters = {
        considerationToken: order.protocol_data.consideration[0].token,
        considerationIdentifier: order.protocol_data.consideration[0].identifierOrCriteria,
        considerationAmount: order.protocol_data.consideration[0].startAmount + order.protocol_data.consideration[1].startAmount,
        offerer: order.protocol.parameters.offerer,
        zone: order.protocol_data.parameters.zone,
        offerToken: order.protocol_data.parameters.offer.ItemType,
        offerIdentifier: order.protocol_data.offer.identifierOrCriteria,
        offerAmount: order.protocol_data.offer.startAmount,
        basicOrderType: order.protocol_data.orderType,
        startTime: order.listing_time,
        endTime: order.expiration_time,
        zoneHash: order.protocol_data.parameters.zoneHash,
        salt: order.protocol_data.parameters.salt,
      };
      sendOrderToSeaport(userAddress, orderId, triggerPrice, tokenId, parameters, traderContract);
    })
    .catch(err => {
      console.error(err)
      return;
    });

    // const txData = {
    //   data: 
    // }

    await console.log(parameters);

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




