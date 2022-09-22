const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const { abi: tinyfrensABI} = require('../NftContract/Tinyfrens.json');
const { urNFTraderAddress, WETHTokenAddress, multicallAddress } = require('../app/__config.json');
const { abi: UrNFTraderABI } = require("../app/artifacts/contracts/UrNFTrader.sol/UrNFTrader.json");
const { OpenSeaSDK, Network } = require("opensea-js")

const WETHabi = require('../app/JSON/WETHabi.json');
require('dotenv').config();

/**
 * NEEDS TO BE CLEANED UP
 */

const tinyfrensContractAddress = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8";
const ownerAddressHard = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const privKeyMain = process.env.PRIVATE_KEY;
const privKey2 = process.env.PRIVATE_KEY2;
const privKey3 = process.env.PRIVATE_KEY3
const apiUrl = process.env.GOERLI_API_URL;
const infuraApiUrl = process.env.RINKEBY_API_URL
const testAccount2Hard = "0xc53bf942c381A14036675502Ae69A54595f9c2A8";
const testAccount3Hard = "0x446D078afc01D63D4BB41Da179072954EC3F5719";
const testTriggerPrice = ethers.utils.parseEther("0.4")
const maxApprovalValue = BigInt(((2**256) - 1) /(10**18));
const testTriggerPriceAndFee = BigInt(110000000000000000);
const baseFee = ethers.utils.parseEther('0.015');
const apiKey = process.env.GOERLI_API_KEY;
// const provider = ethers.provider;
// const provider = new ethers.providers.AlchemyProvider('goerli', apiKey);
const provider = new ethers.providers.JsonRpcProvider(apiUrl)

console.log(provider);

const openseaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Goerli,
});

async function main() {
  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: tinyfrensContractAddress,
    tokenId: 1
  });
  console.log(order);
}


main();

it('should get order', async () => {
  const order = await openseaSDK.api.getOrder({
    side: 'ask',
    assetContractAddress: tinyfrensContractAddress,
    tokenId: 1
  });
  console.log(order);
})
/* Test breakdown
** import trader, multicall, and tinyfrens contract address
** test I have control of nft contract and owner 9 of the tinyfrens
** test i have WETH
*/

// describe("Testing NftTrader", function() {
//   let nftContract, nftContractAddress, wETHcontract, wETHcontractAddress, ownersAddress, account2Address, account3Address;
//   let owner = new ethers.Wallet(privKeyMain, ethers.provider);
//   let account2 = new ethers.Wallet(privKey2, ethers.provider);
//   let account3 = new ethers.Wallet(privKey3, ethers.provider);

//   before(async () => {
//       ownersAddress = owner.address
//       account2Address = account2.address;
//       account3Address = account3.address;
//       nftContract = await ethers.getContractAt(tinyfrensABI, tinyfrensContractAddress)
//       nftContractAddress = nftContract.address
//     });
//     describe('Should set up accounts', function() {

//       it("should have all the test accounts", async () => {
//         expect(owner.address).to.equal(ownerAddressHard);
//         expect(await account2.getAddress()).to.equal(testAccount2Hard);
//         expect(await account3.getAddress()).to.equal(testAccount3Hard);
//       })
    
//       it('should have the correct nft contract', async () => {
//         expect(nftContract.address).to.equal(nftContractAddress);
//       });

//       it('should be the owner of the contract', async () => {
//         const [_contractOwner] = await nftContract.functions.owner();
//         expect(_contractOwner).to.equal(ownersAddress);
//       });

//       it('owner should own 8 tinyfrens', async () => {
//         const ownedNfts = await nftContract.balanceOf(ownersAddress);
//         expect(ownedNfts).to.equal(8);
//       });

//       it('account2 should own 2 tinyfrens', async () => {
//         const ownedNfts = await nftContract.balanceOf(account2Address);
//         expect(ownedNfts).to.equal(2);
//       });
//     });

//     describe(`Should be able to use owner's NFTS`, function() {

//       it('should transfer a NFT to account2', async() => {
//         // account2 is starting with 2 tinyfrens
//         // await nftContract.functions['safeTransferFrom(address,address,uint256)'](ownersAddress, account2Address, 1);
//         // const accountTwosBalance = await nftContract.balanceOf(account2.address);
//         // expect(await accountTwosBalance).to.equal(3);
//       });

//       it('should sent back the nft to the owner', async () => {
//         // await nftContract.connect(account2)['safeTransferFrom(address,address,uint256)'](account2Address, ownersAddress, 1);
//         // const accountTwosBalance = await nftContract.balanceOf(account2.address);
//         // expect(await accountTwosBalance).to.equal(2);
//       });

//       it('Should list the nft on opensea', async () => {

//       })

//       /*
//       All tests pass, so at this we know we can fork the rinkeby testnet, run it locally, use the NFT contract, and interact with the blockchain using three different accounts.
//       TODO:
//       - test the UrNFTrader Contract with this NFT collection
//       - be able to buy an NFT off of the User's request(signature) using the user's funds, and send the NFT to the user all in one transaction.
//       - test for the user to be able to sell the NFT through the contract once the floor price hits a certain price.
//       - for the fees: when the user buys an NFT, a fee is automatically included into the initial deposit of the user's funds and will be fully refunded if the user revokes the order. when the user sells an NFT, a fee is cut off at the moment that the contract send's the user back their funds.
        
//       */
//     });

//     describe('UrNFTrader (all with owner)', function() {
//       // these tests are being done on: localhost fork of rinkeby
//       let urNFTrader;
//       let ownerOrderId;
//       let ownersOrders = [];
//       let account2Orders = [];
//       let numberOfOrders;
//       let hasOrders = false; 
//       let provider = ethers.provider;
//       // let IUrNFTrader;
      
//       before( async () => {
//         urNFTrader = await ethers.getContractAt(UrNFTraderABI, "0x44CCeb9874Df3974d0D760aEa64B0b411a30F43E");
//         // Create orders
//         // console.log(urNFTrader);
//         // const order = await openseaSDK.api.getOrder({
//         //   side: 'ask',
//         //   assetContractAddress: tinyfrensContractAddress,
//         //   tokenId: 5
//         // });
//         // console.log(order);

//         numberOfOrders = (await urNFTrader.orderIds(ownersAddress)).toNumber();
//         if ( numberOfOrders != 0) {
//           hasOrders = true;
//           for (let i = 0; i < numberOfOrders; i++ ) {
//             let order = await urNFTrader.buyOrderBook(ownersAddress, i);
//             ownersOrders.push({
//               owner: order.owner,
//               triggerPrice: BigInt(order.triggerPrice),
//               collectionAddress: order.collectionAddress,
//               orderStatus: order.orderStatus,
//               orderId: (order.orderId).toNumber(),
//             });
//           }
//         } 
//       });


//       describe('Should set up test environment', function() {
//         let lastOrderId;
//         let IUrNFTrader;

//         it('should have access to the urNFTrader as owner', async () => {
//           const _owner = await urNFTrader.owner();
//           expect(_owner).to.equal(ownersAddress);

//         });

//         // it(`Should approve the contract to use the owner's funds (first time only)`, async () => {
//         //   if (await wETH.allowance(ownersAddress, urNFTraderAddress) > 1000000000000000) {
//         //     console.log(`is already approved`);
//         //   } else {
//         //     await expect(await wETH.approve(urNFTraderAddress, maxApprovalValue)).to.emit(wETH, 'Approval').withArgs(ownersAddress, urNFTraderAddress, maxApprovalValue);
//         //     ownerOrderId = 0;
//         //   }
//         // })
  
//         // it('DISABLED - should add an order to the buy order book and emit', async () => {
//         // // /*  test logic
//         //   // IUrNFTrader = new ethers.utils.Interface(UrNFTraderABI);
//         //   // const setPriceToBuyData = IUrNFTrader.encodeFunctionData('setPriceToBuy', tinyfrensContractAddress);
//         //   // const feeData = provider.getFeeData()
//         //   // const tx = {
//         //   //   from: account2Address,
//         //   //   to: tinyfrensContractAddress,
//         //   //   value: testTriggerPrice,
//         //   //   data: setPriceToBuyData,
//         //   //   gasPrice: feeData.gasPrice,
//         //   //   nonce: await provider.getTransactionCount(account2Address)
//         //   // }
//         //   // const gasLimit = awaitprovider.estimateGas(tx);

//         //   const gasLimit = await urNFTrader.estimateGas.setPriceToBuy(tinyfrensContractAddress, {value: testTriggerPrice})

//         //   // await expect(await urNFTrader.connect(account3).setPriceToBuy( tinyfrensContractAddress, {value: testTriggerPrice, gasLimit: gasLimit})).to.emit(urNFTrader, "SubmittedNewBuyOrder").withArgs(account2Address, tinyfrensContractAddress, numberOfOrders, (testTriggerPrice - baseFee).toString());

//         //   const setPriceToBuy = await urNFTrader.connect(account3).setPriceToBuy( tinyfrensContractAddress, {value: testTriggerPrice, gasLimit: gasLimit})
//         //   await setPriceToBuy.wait();

//         //   account2Orders.push({
//         //     owner: account2Address,
//         //     triggerPrice: testTriggerPrice,
//         //     collectionAddress: tinyfrensContractAddress,
//         //     orderStatus: 1,
//         //     orderId: numberOfOrders
//         //   });
//         //   // console.log(await urNFTrader.buyOrderBook(account2Address, 0))
//         //   // console.log(account2Orders);
//         // // */  
//         // });

//         it('Should have added the order book', async () => {
//           const currentOrderBook = await urNFTrader.buyOrderBook(account3Address, 0);
//           // console.log(currentOrderBook);
//           expect(currentOrderBook.owner).to.eq(account3Address);
//           expect(currentOrderBook.triggerPrice.toString()).to.equal((testTriggerPrice - baseFee).toString());
//           expect(currentOrderBook.collectionAddress).to.eq(tinyfrensContractAddress);
//           expect(currentOrderBook.orderStatus).to.eq(1);
//           expect(currentOrderBook.refundNeeded).to.eq(false);
//           expect(currentOrderBook.refundAmount).to.eq(0);
//         })

//         // it('urNFTrader should have received the WETH', async () => {
//         //   let contractBalance = await wETH.balanceOf(urNFTraderAddress);
//         //   expect(contractBalance).to.equal(testTriggerPriceAndFee * BigInt(ownersOrders.length))
//         // })

//         it('urNFTrader should have received the ETH', async () => {
//           let contractBalance = await provider.getBalance("0x44CCeb9874Df3974d0D760aEa64B0b411a30F43E")
//           expect(contractBalance).to.equal(testTriggerPrice)
//         });


//         // it('should cancel a buy order (turn on and off)', async () => {
//         //   let orderIdToCancel = 0;
//         //   const gasLimit = await urNFTrader.estimateGas.cancelOrderToBuy(orderIdToCancel)
//         //   await expect(await urNFTrader.connect(account2).cancelOrderToBuy(orderIdToCancel, {gasLimit: gasLimit})).to.emit(urNFTrader, "CanceledBuyOrder").withArgs(ownersAddress, tinyfrensContractAddress);
//         //   ownersOrders[orderIdToCancel].orderStatus = 2;
//         //   console.log(ownersOrders[orderIdToCancel])
//         //   console.log(ownersOrders)
//         // })
//       });

//       describe('Integrate opensea-js and execute order', function() {
//         let purchasePrice;
//         let order;
//         let tokenId;
//         let parameters, encodedParams;
//         const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000"



//         before(async () => {
//           order = await openseaSDK.api.getOrder({
//             side: 'ask',
//             assetContractAddress: tinyfrensContractAddress,
//             tokenId: 5
//           });
//           purchasePrice = order.currentPrice;
//           tokenId = order.protocolData.parameters.offer[0].identifierOrCriteria;
//           let abi = ethers.utils.defaultAbiCoder;
//           parameters = {
//             considerations: [],
//             offerer: order.protocolData.parameters.offerer,
//             zone: order.protocolData.parameters.zone,
//             offerToken: order.protocolData.parameters.offer[0].token,
//             offerItemType: order.protocolData.parameters.offer[0].itemType,
//             offerIdentifier: order.protocolData.parameters.offer[0].identifierOrCriteria,
//             offerStartAmount: order.protocolData.parameters.offer[0].startAmount,
//             offerEndAmount: order.protocolData.parameters.offer[0].endAmount,
//             basicOrderType: order.protocolData.parameters.orderType,
//             startTime: order.listingTime,
//             endTime: order.expirationTime,
//             zoneHash: order.protocolData.parameters.zoneHash,
//             salt: order.protocolData.parameters.salt,
//             counter: order.protocolData.parameters.counter,
//             signature: order.protocolData.signature,
//             conduitKey: order.protocolData.parameters.conduitKey,
//             totalOriginalConsiderationItems: order.protocolData.parameters.totalOriginalConsiderationItems,
//           };
          
//           let considerationItemsTuple = [];
//           let considerationsArr = order.protocolData.parameters.consideration;
//           for (let i = 0; i < considerationsArr.length; i++) {
//             let newConsideration = {
//               token: order.protocolData.parameters.consideration[i].token,
//               itemType: order.protocolData.parameters.consideration[i].itemType,
//               identifierOrCriteria: order.protocolData.parameters.consideration[i].identifierOrCriteria,
//               startAmount: order.protocolData.parameters.consideration[i].startAmount,
//               endAmount: order.protocolData.parameters.consideration[i].endAmount,
//               recipient: order.protocolData.parameters.consideration[i].recipient
//             }
//             // purchasePrice will only apply to not 
//             parameters.considerations.push(newConsideration);
//             considerationItemsTuple.push([newConsideration.itemType, newConsideration.token, newConsideration.identifierOrCriteria, newConsideration.startAmount, newConsideration.endAmount, newConsideration.recipient])
//           }
//           // console.log(considerationItemsTuple)
//           // fulfillAdvanced Order
//           encodedParams = abi.encode(
//             ["tuple( tuple(address, address, tuple(uint8, address, uint256, uint256, uint256 endAmount)[], tuple(uint8, address, uint256, uint256, uint256, address)[], uint8, uint256, uint256, bytes32, uint256, bytes32, uint256), uint120, uint120, bytes, bytes)", "tuple(uint256, uint8, uint256, uint256, bytes32[])[]", "bytes32", "address"],
//             [ 
//               [
//                 [parameters.offerer, parameters.zone, [[parameters.offerItemType, parameters.offerToken, parameters.offerIdentifier, parameters.offerStartAmount, parameters.offerEndAmount]], considerationItemsTuple, parameters.basicOrderType, parameters.startTime, parameters.endTime, parameters.zoneHash, parameters.salt, parameters.conduitKey, parameters.totalOriginalConsiderationItems
//                 ],
//                1, 1, parameters.signature, zeroHash
//               ],
//             [], zeroHash, account3Address 
//           ] 
//           );
//           console.log(order);
//         });

//         it('should have the correct order', async () => {
//           expect(purchasePrice).to.equal(ethers.utils.parseEther('0.35'));
//           expect(order.makerAssetBundle.assetContract.address).to.eq(tinyfrensContractAddress.toLowerCase());
//           // console.log(order.protocolData.parameters);
//           // console.log(order);
//         });

//         it('should run testOrderInfo', async () => {
//           // const IUrNFTrader = new ethers.utils.Interface(UrNFTraderABI);
//           // // console.log(await urNFTrader.executeBuyOrderTest([account2Address, 0, purchasePrice, tokenId]))
//           // const abiEncoder = ethers.utils.defaultAbiCoder;
//           // const testExecute = await urNFTrader.testOrderInfo([account2Address, 0, purchasePrice, tokenId])
//           // const receipt = await testExecute.wait();
//           // console.log(receipt.logs)
//           // const logs = receipt.logs.map( (log) => IUrNFTrader.parseLog(log));
//           // console.log(logs);

//           // console.log(abiEncoder.decode([ "tuple(address,uint256,uint256,uint256)"], logs[0].args[0].hash))

//           // ethers.utils.parseBytes32String(logs[0].args[0].hash)
//         });

//         it('should run testOrderParams', async () => {
//           // const IUrNFTrader = new ethers.utils.Interface(UrNFTraderABI);
//           // // const abiEncoder = ethers.utils.defaultAbiCoder;
//           // // const data = abiEncoder.encode([ "tuple(address, uint256, uint256, uint256)"], [[account2Address, 2, ethers.utils.parseEther('1.23'), 69]])
//           // const testExecute = await urNFTrader.testOrderParams(encodedParams);
//           // const receipt = await testExecute.wait();
//           // console.log(receipt.logs)
//           // const logs = receipt.logs.map( (log) => IUrNFTrader.parseLog(log));
//           // console.log(logs);

//           // console.log(abiEncoder.decode([ "tuple(address,uint256,uint256,uint256)"], logs[0].args[0].hash))
//         });
//           //

//         it('should buy the NFT manually (fulfillAdvancedOrder) through UrNFTrader', async () => {
//         // /*  
//           const IUrNFTrader = new ethers.utils.Interface(UrNFTraderABI);
//           // expect(await urNFTrader.executeBuyOrder([account2Address, 0, purchasePrice, tokenId], encodedParams)).to.emit(urNFTrader, 'TestSeaport').withArgs(true, "no error in fulfilled")
//           // const fulfilled = await urNFTrader.executeBuyOrder([account3Address, 0, purchasePrice, tokenId], encodedParams);
//           // console.log('waiting...');
//           // const receipt = await fulfilled.wait();
//           // const logs = receipt.logs.map( (log) => IUrNFTrader.parseLog(log));
//           // console.log(logs);

//           // console.log(encodedFunctionResult)
//           // console.log(encodedFunctionName);
//           // console.log(encodedExecuteFunction);
//           // const tx = {
//           //   from: ownersAddress,
//           //   to: urNFTraderAddress,
//           //   data: encodedExecuteFunction,
//           //   gasPrice: feeData.gasPrice
//           // }
//           // tx.gasLimit = await provider.estimateGas(tx);
//           // console.log(tx);
//         // */ 
//         });

//         it('should have updated to buyOrderBook', async () => {
          
//         })
//       })
//     })
// });