const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const tinyfrens = require('../NftContract/Tinyfrens.json');
const { urNFTraderAddress, WETHTokenAddress, multicallAddress } = require('../app/__config.json');
const WETHabi = require('../app/JSON/WETHabi.json');
require('dotenv').config();

const tinyfrensContractAddress = "0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D";
const ownerAddressHard = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const privKeyMain = process.env.PRIVATE_KEY;
const privKey2 = process.env.PRIVATE_KEY2;
const privKey3 = process.env.PRIVATE_KEY3
const testAccount2Hard = "0xc53bf942c381A14036675502Ae69A54595f9c2A8";
const testAccount3Hard = "0x446D078afc01D63D4BB41Da179072954EC3F5719";
const testTriggerPrice = BigInt(100000000000000000);
const maxApprovalValue = BigInt(((2**256) - 1) /(10**18));
const testTriggerPriceAndFee = BigInt(110000000000000000);


/* Test breakdown
** import trader, multicall, and tinyfrens contract address
** test I have control of nft contract and owner 9 of the tinyfrens
** test i have WETH
*/

describe("Testing NftTrader", function() {
  let nftContract, nftContractAddress, wETHcontract, wETHcontractAddress, ownersAddress, account2Address, account3Address;
  let owner = new ethers.Wallet(privKeyMain, ethers.provider);
  let account2 = new ethers.Wallet(privKey2, ethers.provider);
  let account3 = new ethers.Wallet(privKey3, ethers.provider);

  before(async () => {
      ownersAddress = owner.address
      account2Address = account2.address;
      account3Address = account3.address;
      let [hardhatAccount] = await ethers.getSigners();
      await hardhatAccount.sendTransaction({
        to: ownersAddress,
        value: ethers.utils.parseEther('10.0')
      })
      await hardhatAccount.sendTransaction({
        to: account2Address,
        value: ethers.utils.parseEther('10.0')
      })
      await hardhatAccount.sendTransaction({
        to: account3Address,
        value: ethers.utils.parseEther('10.0')
      })
      let NftContract = await ethers.getContractFactory("TestTinyfrens")
      nftContract = await NftContract.connect(owner).deploy();
      await nftContract.deployed();
      nftContractAddress = nftContract.address;
      await nftContract.mintNft(3)
      // nftContract = await ethers.getContractAt(tinyfrens.abi, tinyfrensContractAddress);
      let WETHcontract = await ethers.getContractFactory("WETHToken");
      wETHcontract = await WETHcontract.connect(owner).deploy()
      await wETHcontract.deployed();
      wETHcontractAddress = wETHcontract.address;
    });
  
    describe('Should set up accounts', function() {

      it("should have all the test accounts", async () => {
        expect(await owner.getAddress()).to.equal(ownerAddressHard);
        expect(await account2.getAddress()).to.equal(testAccount2Hard);
        expect(await account3.getAddress()).to.equal(testAccount3Hard);
      })
    
      it('should have the correct nft contract', async () => {
        expect(nftContract.address).to.equal(nftContractAddress);
      });

      it('should be the owner of the contract', async () => {
        const [_contractOwner] = await nftContract.functions.owner();
        expect(_contractOwner).to.equal(ownersAddress);
      });

      it('owner should own 3 NFTs that were minted', async () => {
        const ownedNfts = await nftContract.balanceOf(ownersAddress);
        expect(ownedNfts).to.equal(3);
      });

      it('Owner should have access to wETH', async () => {
        const amount = ethers.utils.formatEther(await wETHcontract.balanceOf(ownersAddress));
        expect(+amount).to.be.above(9900);
      })
    });

    describe(`Should be able to use owner's NFTS`, function() {

      it('should transfer a NFT to account2', async() => {
        await nftContract.functions['safeTransferFrom(address,address,uint256)'](ownersAddress, account2Address, 1);
        const accountTwosBalance = await nftContract.balanceOf(account2.address);
        expect(await accountTwosBalance).to.equal(1);
      });

      it('should sent back the nft to the owner', async () => {
        await nftContract.connect(account2)['safeTransferFrom(address,address,uint256)'](account2Address, ownersAddress, 1);
        const accountTwosBalance = await nftContract.balanceOf(account2.address);
        expect(await accountTwosBalance).to.equal(0);
      });

      it('Should list the nft on opensea')

      /*
      All tests pass, so at this we know we can fork the rinkeby testnet, run it locally, use the NFT contract, and interact with the blockchain using three different accounts.
      TODO:
      - test the UrNFTrader Contract with this NFT collection
      - be able to buy an NFT off of the User's request(signature) using the user's funds, and send the NFT to the user all in one transaction.
      - test for the user to be able to sell the NFT through the contract once the floor price hits a certain price.
      - for the fees: when the user buys an NFT, a fee is automatically included into the initial deposit of the user's funds and will be fully refunded if the user revokes the order. when the user sells an NFT, a fee is cut off at the moment that the contract send's the user back their funds.
        
      */
    });

    describe('UrNFTrader (all with owner)', function() {
      // these tests are being done on: localhost fork of rinkeby
      let urNFTrader;
      let ownerOrderId;
      let ownersOrders = [];
      let numberOfOrders;
      let hasOrders = false; 
      
      before( async () => {
        // const UrNFTrader = await ethers.getContractFactory("UrNFTrader", owner);
        // const urNFTrader = await UrNFTrader.deploy();
        // await urNFTrader.deployed();
        // Create orders

        numberOfOrders = (await urNFTrader.orderIds(ownersAddress)).toNumber();
        if ( numberOfOrders != 0) {
          hasOrders = true;
          for (let i = 0; i < numberOfOrders; i++ ) {
            let order = await urNFTrader.buyOrderBook(ownersAddress, i);
            ownersOrders.push({
              owner: order.owner,
              triggerPrice: BigInt(order.triggerPrice),
              collectionAddress: order.collectionAddress,
              orderStatus: order.orderStatus,
              orderId: (order.orderId).toNumber(),
            });
          }
        } 
      });


      describe('Should set up test environment', function() {
        let lastOrderId

        it('should have access to the urNFTrader as owner', async () => {
          const _owner = await urNFTrader.owner();
          expect(_owner).to.equal(ownersAddress);

        });

        it(`Should approve the contract to use the owner's funds (first time only)`, async () => {
          if (await wETH.allowance(ownersAddress, urNFTraderAddress) > 1000000000000000) {
            console.log(`is already approved`);
          } else {
            await expect(await wETH.approve(urNFTraderAddress, maxApprovalValue)).to.emit(wETH, 'Approval').withArgs(ownersAddress, urNFTraderAddress, maxApprovalValue);
            ownerOrderId = 0;
          }
        })
  
        it('should add an order to the buy order book and emit', async () => {
          await expect(urNFTrader.setPriceToBuy(testTriggerPrice, tinyfrensContractAddress)).to.emit(urNFTrader, "submittedNewBuyOrder").withArgs(ownersAddress, tinyfrensContractAddress, numberOfOrders, testTriggerPrice);

          ownersOrders.push({
            owner: ownersAddress,
            triggerPrice: testTriggerPrice,
            collectionAddress: tinyfrensContractAddress,
            orderStatus: 0,
            orderId: numberOfOrders
          });
        });

        it('urNFTrader should have received the WETH', async () => {
          let contractBalance = await wETH.balanceOf(urNFTraderAddress);
          expect(contractBalance).to.equal(testTriggerPriceAndFee * BigInt(ownersOrders.length))

        })

        it('should cancel a buy order (turn on and off)', async () => {
          // let orderIdToCancel = 0;
          // await expect(urNFTrader.cancelOrderToBuy(orderIdToCancel)).to.emit(urNFTrader, "canceledBuyOrder").withArgs(ownersAddress, tinyfrensContractAddress);
          // ownersOrders[orderIdToCancel].orderStatus = 2;
          // console.log(ownersOrders[orderIdToCancel])
          console.log(ownersOrders)
        })
      });

      describe('Execute transactions on behalf of user', function() {

        it('should buy nft for user', async () => {

        })
      })
    })
});