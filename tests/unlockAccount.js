const { expect } = require('chai');
const { ethers, network } = require('hardhat');
const tinyfrens = require('../NftContract/Tinyfrens.json');

const tinyfrensContractAddress = "0x874b81b49c6C2a2A939ac354D6C1F1DC20f8580D";
const contractOwner = "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b";
const testAccount2 = "0xc53bf942c381A14036675502Ae69A54595f9c2A8";
const testAccount3 = "0x446D078afc01D63D4BB41Da179072954EC3F5719";

describe("Testing NftTrader", function() {
  let owner, account2, account3, nftContract;

  async function getDeployedContract() {

  }
  

  before(async () => {
      nftContract = await ethers.getContractAt(tinyfrens.abi, tinyfrensContractAddress);
    });
  
    describe('Should set up test environment', function() {

      it("should have all the test accounts", async () => {
        [owner, account2, account3] = await ethers.getSigners();
        expect(owner.address).to.equal(contractOwner);
        expect(account2.address).to.equal(testAccount2);
        expect(account3.address).to.equal(testAccount3);
      })
    
      it('should have the correct nft contract', async () => {
        expect(nftContract.address).to.equal(tinyfrensContractAddress);
      });

      it('should be the owner of the contract', async () => {
        const [_contractOwner] = await nftContract.functions.owner();
        expect(_contractOwner).to.equal(owner.address);
      });

      it('owner should own all nfts', async () => {
        const ownedNfts = await nftContract.balanceOf(owner.address);
        expect(ownedNfts).to.equal(10);
      })
    });

    describe(`Should be able to use owner's NFTS`, function() {

      before(async () => {
        nftContract = await ethers.getContractAt(tinyfrens.abi, tinyfrensContractAddress)
      });

      it('should transfer a NFT to account2', async() => {
        await nftContract.functions['safeTransferFrom(address,address,uint256)'](owner.address, account2.address, 1);
        const accountTwosBalance = await nftContract.balanceOf(account2.address);
        expect(await accountTwosBalance).to.equal(1);
      });

      it('should sent back the nft to the owner', async () => {
        await nftContract.connect(account2)['safeTransferFrom(address,address,uint256)'](account2.address, owner.address, 1);
        const accountTwosBalance = await nftContract.balanceOf(account2.address);
        expect(await accountTwosBalance).to.equal(0);
      });

      /*
      All tests pass, so at this we know we can fork the rinkeby testnet, run it locally, use the NFT contract, and interact with the blockchain using three different accounts.
      TODO:
      - test the UrNFTrader Contract with this NFT collection
      - be able to buy an NFT off of the User's request(signature) using the user's funds, and send the NFT to the user all in one transaction.
      - test for the user to be able to sell the NFT through the contract once the floor price hits a certain price.
      - for the fees: when the user buys an NFT, a fee is automatically included into the initial deposit of the user's funds and will be fully refunded if the user revokes the order. when the user sells an NFT, a fee is cut off at the moment that the contract send's the user back their funds.
        
      */
    })





});