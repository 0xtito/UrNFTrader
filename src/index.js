import { ethers } from "ethers";
import "./index.css"


async function newOrder() {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });

  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, MyNFTrader.abi, signer);
  const nftCollectionAddress = document.getElementById('nft-contract-address').value;
  const purchasePrice = document.getElementById('max-buy-price').value;
  console.log(nftCollectionAddress, purchasePrice);
}

document.getElementById('create-order').addEventListener('click', newOrder);

/*
TODO:
  have the user approve the contract to use their ether on the FRONT END
  

*/

