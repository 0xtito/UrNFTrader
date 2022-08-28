

// test nft collection: 0xfB7e002151343efA2a3A5f2EA98Db0D21efB75Ce

export default async function setBuyOrder(nftCollectionAddress, purchasePrice, contractInfo ) {
  const { signer, contract } = contractInfo;

  console.log({signer, contract, nftCollectionAddress, purchasePrice});
}