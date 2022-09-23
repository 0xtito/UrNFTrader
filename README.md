# UrNFTrader

## Purpose
This project was created as my final project for the [Chainshot](https://www.chainshot.com/) bootcamp. As a semi-recovered NFT-degen, I always wondered if you could create an exchange designed for buying and selling NFTs - so I set out to see if you could (spoiler: you can).

## How it Works
As it stands today, the app allows you to create a buy limit order for any (ERC-721) NFT collection on [Opensea Testent](https://testnets.opensea.io/) **only** on the Goerli blockchain. A user can set a buy limit order, then by using Opensea's [Stream API](https://docs.opensea.io/reference/stream-api-overview), the app will begin to listen for all listings from that collection, and only make a call to the UrNFTrader contract if the listing is at or below the set trigger price.

Using a simple UI (which is essentially a variation of Chainshot's [MultiSig](https://github.com/ChainShot/MultiSig) UI), a user would input the contract address of the NFT collection they want an NFT from and the trigger price (ETH) which is the maximum price the user would like to buy an NFT at. Then once the user signs the transaction, the user sends the trigger price plus 0.015 ETH (base fee for using the `setBuyOrder` function). The contract will store the ETH so once a listed NFT meets the user's predefined critieria, the contract can buy the NFT right away.

Once an order meeting the user's critiera is found, the app begins to gather the neccesary order information using [opensea-js](https://github.com/ProjectOpenSea/opensea-js). Then, the app sends the UrNFTrader contract the necessary data to accurately select the correct order (orderInfo inside `executeBuyOrder`) and an enoded AdvancedOrder struct (orderParams inside `executeBuyOrder`) which is needed to execute the Seaport function call `fulfillAdvancedOrder`.

Within the `executeBuyOrder` function - `orderParams` is decoded. Assuming the order information is correct, a call is made to the [Seaport contract](https://goerli.etherscan.io/address/0x00000000006c3852cbEf3e08E8dF289169EdE581#code) through the Consideration [Interface](https://goerli.etherscan.io/address/0x00000000006c3852cbEf3e08E8dF289169EdE581#code#F3#L1). This function will return a boolean value labeled as `fulfilled`. If the  order is not fulfilled, the order status will change to failed and the user can get a full reimbursement.  If fulfilled, the user will recieve their NFT and the price difference between the trigger price and the purchase price in ETH. All in one transaction.

## Contract Address

| Chain                   | Address                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goerli                 | [0x0389Ef7929ecB3E95522b652fA7d61520563eCC4](https://goerli.etherscan.io/address/0x0389ef7929ecb3e95522b652fa7d61520563ecc4#code)                                       |
                                                                                                                                         


## How is This Helpful
This would also users who do not constantly watch the floor of their favorite projects to set an order to buy an NFT from that collection the moment it is listed. Anybody who went through the past NFT bull run has seen floor prices can fall and rise very quickly. It would be very useful to be able to snipe a floor NFT without even needing to be there when it is listed. 

## Other Features
- Allows the user to cancel their order and recieve a full refund (including the 0.015 ETH fee)
- Only the contract owner and the user themselves is able to see the order information. Allowing you to place order's with the comfort that nobody can see what orders you have set.
- The contract owner can only withdraw ETH that is not meant to be used for pending order (except for the `closeFunction` call).


## (Some) Known Limitations
- The order will only be executed if the app is running and the user is signed into their wallet at the time of listing. This is due to not having an API endpoint where the pending order data is stored.
- Can only execute orders to buy NFT's, not to sell.
- Since the app and contract only work with opensea, it is heavily dependent on their SDK and Stream API.
- Sometimes when listing on Opensea, it will return an error but the NFT will still be listed. The app will not catch this listing as the Stream API does not emit it.

## Possible Future Upgrades
- Redeploying the contract through a proxy for upgradability
- Restructure the app to make it much simpler for devs to clone and play around with themselves
- create the functionality to sell NFTs through the contract once the floor price hits a certain price
- Create an API endpoint so all pending order's can be stored and listened to without the user being on the app
- Deploy through a platform like Vercel to allow the app to run continously


### That's all :)
Thank you to the Chainshot team for giving me the opportunity to be a part of the bootcamp. Been a great learning experience. One step closer to be a true buidler 👷

### 🔗 My Twitter
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/tito_cda)

