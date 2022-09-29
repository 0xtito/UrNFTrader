const { expect } = require('chai');
const { ethers } = require('hardhat');
const { OpenSeaSDK, Network } = require("opensea-js")
const tinyfrensJSON = require('../app/JSON/Tinyfrens.json');
require('dotenv').config();

const tinyfrensContractAddress = "0x22dB3E3828042714ed1144bfb7a6075Bbb1ca7f8";
const urNFTraderAddress = "0x0389Ef7929ecB3E95522b652fA7d61520563eCC4";
const privKeyMain = process.env.PRIVATE_KEY;
const privKey2 = process.env.PRIVATE_KEY2;
const privKey3 = process.env.PRIVATE_KEY3
const apiURL = process.env.GOERLI_API_URL;
const testTriggerPrice = ethers.utils.parseEther('0.2');
const baseFee = ethers.utils.parseEther("0.015");
const contractStartAmount = ethers.utils.parseEther('0.015');


/**
 * NEEDS TO BE CLEANED UP
 */

describe("Testing NftTrader", function() {
  let tinyfrens, urNFTrader, ownersAddress, account2Address, account3Address;
  // const provider = new ethers.providers.JsonRpcProvider(apiURL);
  const provider = ethers.provider
  let owner = new ethers.Wallet(privKeyMain, provider);
  let account2 = new ethers.Wallet(privKey2, provider);
  let account3 = new ethers.Wallet(privKey3, provider);

  before(async () => {
      ownersAddress = owner.address
      account2Address = account2.address;
      account3Address = account3.address;
      // let [hardhatAccount] = await ethers.getSigners();
      // await hardhatAccount.sendTransaction({
      //   to: ownersAddress,
      //   value: ethers.utils.parseEther('10.0')
      // })
      // await hardhatAccount.sendTransaction({
      //   to: account2Address,
      //   value: ethers.utils.parseEther('10.0')
      // })
      // await hardhatAccount.sendTransaction({
      //   to: account3Address,
      //   value: ethers.utils.parseEther('10.0')
      // })
      urNFTrader = await ethers.getContractAt("UrNFTraderV1", urNFTraderAddress, owner);
      tinyfrens = new ethers.Contract(tinyfrensContractAddress, tinyfrensJSON.abi, provider);
    });
  
    describe('Should set up the test environment', function() {
    
      it('should have the correct nft contract', async () => {
        expect(tinyfrens.address).to.equal(tinyfrensContractAddress);
      });

      // it()

      it('should be the owner of the UrNFTrader contract', async () => {
        const contractOwner = await urNFTrader.owner();
        expect(contractOwner).to.equal(owner.address);
      });

      it('should be the owner of the tinyfrens contract', async () => {
        const contractOwner = await tinyfrens.owner();
        expect(contractOwner).to.equal(owner.address);
      });


      it('urNFTrader should have 0 pending orders', async () => {
        const pendingOrdersAmount = await urNFTrader.pendingOrdersETHAmount();
        expect(pendingOrdersAmount).to.equal(0);
      });
    });

    describe('UrNFTrader', function() {
      // these tests are being done on: localhost fork of rinkeby
      let accountOrders = [];
      let numberOfOrders;
      let hasOrders = false; 
      let pendingOrders = [];

      beforeEach( async () => {
        numberOfOrders = (await urNFTrader.totalOrders(account2Address)).toNumber();
        // console.log(`${numberOfOrders - 3} orders`);
        accountOrders = [];
        pendingOrders = [];
        if (numberOfOrders < 3 ) return;
          hasOrders = true;
          for (let i = 0; i < numberOfOrders; i++ ) {
            let order = await urNFTrader.getBuyOrder(account2Address, i);
            accountOrders.push({
              owner: order.owner,
              triggerPrice: BigInt(order.triggerPrice),
              collectionAddress: order.collectionAddress,
              orderStatus: order.orderStatus,
              orderId: (order.orderId).toNumber(),
            });
          };
          for (let i = 0; i < accountOrders.length; i++) {
            if (accountOrders[i].orderStatus == 1 ) pendingOrders.push(accountOrders[i]);
          }
      });

      describe('buy and cancel an order', () => {
        it('should add an order to the buy order book and emit', async () => {
          const lastBuyOrder = accountOrders.length - 1;
          await expect(await urNFTrader.connect(account2).setPriceToBuy( tinyfrensContractAddress, {value: testTriggerPrice.add(baseFee)})).to.emit(urNFTrader, "SubmittedNewBuyOrder").withArgs(account2Address, tinyfrensContractAddress, accountOrders[lastBuyOrder].orderId + 1);
        });

        it('urNFTrader contract should have received the ETH', async () => {

          let contractBalance = await provider.getBalance(urNFTrader.address)
          expect(contractBalance.toBigInt()).to.equal( ((testTriggerPrice.add(baseFee)).toBigInt() * BigInt(pendingOrders.length)) + contractStartAmount.toBigInt() )
        })

        it('user should cancel last buy order', async () => {
          const lastOrderId = accountOrders[accountOrders.length - 1].orderId;
          await expect(urNFTrader.connect(account2).cancelOrderToBuy(lastOrderId)).to.emit(urNFTrader, "CanceledBuyOrder").withArgs(account2Address, tinyfrensContractAddress, lastOrderId);
          accountOrders[lastOrderId].orderStatus = 3;
        });
      });

      describe('set buy order and check order book', () => {

        it('should set a buy order', async () => {
          const lastBuyOrder = accountOrders.length - 1;
          await expect(await urNFTrader.connect(account2).setPriceToBuy( tinyfrensContractAddress, {value: testTriggerPrice.add(baseFee)})).to.emit(urNFTrader, "SubmittedNewBuyOrder").withArgs(account2Address, tinyfrensContractAddress, accountOrders[lastBuyOrder].orderId + 1);
        });

        it('should have the correct pending ETH amount', async () => {
          const pendingOrdersETHAmount = await urNFTrader.pendingOrdersETHAmount();
          expect(pendingOrdersETHAmount).to.equal(testTriggerPrice);
        });

        it('should return the correct order info', async () => {
          const lastBuyOrder = accountOrders.length - 1;
          const orderInfo = await urNFTrader.getBuyOrder(account2Address, lastBuyOrder);
          expect(orderInfo.owner).to.equal(account2Address);
          expect(orderInfo.triggerPrice).to.equal(testTriggerPrice);
          expect(orderInfo.collectionAddress).to.equal(tinyfrensContractAddress);
          expect(orderInfo.orderStatus).to.equal(1);
          expect(orderInfo.orderId).to.equal(lastBuyOrder);
        });

        it('user should cancel last buy order', async () => {
          const lastOrderId = accountOrders[accountOrders.length - 1].orderId;
          await expect(urNFTrader.connect(account2).cancelOrderToBuy(lastOrderId)).to.emit(urNFTrader, "CanceledBuyOrder").withArgs(account2Address, tinyfrensContractAddress, lastOrderId);
        });

        it('should send ETH + fee back to user', async () => {
          const contractBalance = await provider.getBalance(urNFTrader.address);
          expect(contractBalance).to.equal( ((testTriggerPrice.add(baseFee)).toBigInt() * BigInt(pendingOrders.length)) + contractStartAmount.toBigInt() );
        });

        it('should have the correct pending ETH amount', async () => {
          const pendingOrdersETHAmount = await urNFTrader.pendingOrdersETHAmount();
          expect(pendingOrdersETHAmount).to.equal(0);
        });
      })
    })
});