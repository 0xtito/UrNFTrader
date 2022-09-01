import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(ethereum);
const seaport = new Seaport(provider);

export default async function executeOrder(orderInfo, contractInfo, orderEvent) {

  const { userAddress, collectionAddress, orderId, triggerPrice } = orderInfo;
  const { signer, traderContract } = contractInfo
  const offererAddress = orderEvent.maker.address;
  const listedTimeInSeconds = new Date(orderEvent.payload.listing_date).getTime()/1000;
  cosnt 

  new ethers.Contract()


  console.log('Order executed!! (not really)');
  console.log(seaport);
  console.log(orderInfo);



  const { executeAllActions } = await seaport.fulfillOrder({
    offer: [
      {
  
      }
    ]
  });
}


// let collection;

