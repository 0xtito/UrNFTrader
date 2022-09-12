import { Seaport } from '@opensea/seaport-js';
import { ethers } from 'ethers';
import {orders} from '../orderObject.json'
import { ItemType } from '@opensea/seaport-js/lib/constants';
require('dotenv').config()

const rinkebyAPI = process.env.RINKEBY_API;
// Account 2
const privKey = process.env.PRIVATE_KEY2;


// const provider = new ethers.providers.Web3Provider(ethereum);
const provider = new ethers.providers.getDefaultProvider('http://localhost:1234');
const seaport = new Seaport(provider);
const offerer = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
// const uniswapABI = UniswapRouterArtifact.abi;
const WETHRinkeby = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const WETHMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function listTinyfren() {
  const { executeAllActions } = await seaport.createOrder(
    {
      offer: [
        {
          ItemType: ItemType.ERC721,
          token: '0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D',
          identifier: "3" 
        },
      ],
      consideration: [
        {
          amount: ethers.utils.parseEther('0.15'),
          recipient: offerer
        }
      ]
    },
    offerer
  );

  const order = await executeAllActions();
  console.log(order)
}