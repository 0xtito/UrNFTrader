const {ethers, providers} = require('ethers');
const tinyfrensAddress = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8";
require('dotenv').config();
const tinyfrensABI = require('../app/JSON/Tinyfrens.json').abi;
const privKey3 = process.env.PRIVATE_KEY3;


async function listNFT() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

  const lister = new ethers.Wallet(privKey3, provider);

  const tinyFrensContract = new ethers.Contract(tinyfrensAddress, tinyfrensABI, provider );
  console.log(await tinyFrensContract.balanceOf(lister.address))

}

listNFT();