// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract MyNFTrader {
  address owner;
  address private wrappedEther = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  // user => collection address => bool
  // mapping(address => mapping(address => bool)) approvedNFTtoUse;
  // mapping(address => mapping(address => bool)) approvedEthToUse;
  // user => orderID => BuyOrder struct
  mapping(address => mapping(uint => BuyOrder)) buyOrderBook;
  // user => total Number of Orders (can loop through to find the current contract address)
  mapping(address => uint) orderIds;

  enum OrderStatus { Pending, Executed, Canceled}

  struct BuyOrder {
    address owner;
    uint tiggerPrice;
    address collectionAddress;
    OrderStatus _orderStatus;
  }

  constructor() {
    owner = msg.sender;
  }

  event submittedNewBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed triggerPrice);
  event submitPriceToSell(address indexed addr, address indexed collectionAddress, uint indexed triggerPrice);

  function setPriceToBuy(uint _triggerPrice, address _collectionAddress) external {
    /*
      Steps:
      1) Check for approval
      2) Set Order
      3) emit new Order
    */ 
    require(IERC20(wrappedEther).allowance(msg.sender, address(this)) >= _triggerPrice, "User has not approved the contract to use funds");
    // emit ApprovalForAll(owner, operator, approved);
    (bool success, ) = payable(address(this)).call{value: _triggerPrice}("");
    require(success, "failed to place assets into contract");
    buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, _triggerPrice, _collectionAddress, OrderStatus.Pending);
    orderIds[msg.sender]++;
    emit submittedNewBuyOrder(msg.sender, _collectionAddress, _triggerPrice);
  }

  function cancelOrderToBuy(uint _orderId) external {}

  // NEED TO CALL APPROVE FROM THE FRONT END
  // function revokeApproval() external {
  //   require(IERC20(wrappedEther).allowance(msg.sender, address(this)) != 0, "Address not currently approved!");
  //   IERC20(wrappedEther).approve(msg.sender, address(this))
  // }

  receive() external payable {}

}