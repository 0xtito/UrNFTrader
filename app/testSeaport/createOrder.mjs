import { Seaport } from '@opensea/seaport-js';
import { ItemType } from '@opensea/seaport-js/lib/constants.js';
import { ethers } from 'ethers';
import tinyfrens from "../../NftContract/Tinyfrens.json"

const provider = new ethers.providers.Web3Provider(ethereum);
const offerer = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const fulfiller = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
let executed = false;

// const traderContract = "0x140a8C2681700B4f3fb691386f13c60cC56E85a1"

// const owner =  provider.getSigner(0);

// const nftCollectionAddress = "0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D";

// const nftContract = new ethers.Contract(nftCollectionAddress, tinyfrens.abi, owner);

// if (!executed) {
//   const tx = await nftContract.approve(traderContract,6);
//   await tx.wait();
//   executed = true;
// }


const seaport = new Seaport(provider);



export default async function executeOrder() {

  console.log(seaport);
  // console.log(orderInfo);
  

  const { executeAllActions } = await seaport.createOrder({
    offer: [
      {
        itemType: ItemType.ERC721,
        token: "0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D",
        identifier: "1"
      },
    ],
    consideration: [
      {
        amount: ethers.utils.parseEther('.08').toString(),
        recipient: offerer
      },
    ],
  },
  offerer
  );

  const order = await executeAllActions();
  console.log(order);

  const { executeAllActions: executeAllFulfillActions } =
  await seaport.fulfillOrder({
    order,
    accountAddress: fulfiller,
  });

  const transaction = await executeAllFulfillActions();
  console.log(`tx: ${transaction}`);
}

executeOrder()
.then(
  result => console.log(result))
.catch(
  error => console.error(error)
);

