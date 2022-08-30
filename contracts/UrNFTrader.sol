// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract UrNFTrader {
  address public owner;
  // address private wrappedEther = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  // address private wrappedEtherTestnet = 0x90Ca7407b4518eA7C6480e7F92C2E166A7bcea81;
  address public wrappedEtherAddress;

  uint baseFee = 10000000000000000 wei;
  // user => collection address => bool
  // mapping(address => mapping(address => bool)) approvedNFTtoUse;
  // mapping(address => mapping(address => bool)) approvedEthToUse;
  // user => orderID => BuyOrder struct
  mapping(address => mapping(uint => BuyOrder)) public buyOrderBook;
  // user => total Number of Orders (can loop through to find the current contract address)
  mapping(address => uint) public orderIds;
  mapping(address => bool) public isApprovedERC20;

  enum OrderStatus { Pending, Executed, Canceled}

  struct BuyOrder {
    address owner;
    uint tiggerPrice;
    address collectionAddress;
    OrderStatus _orderStatus;
  }

  constructor(address _wrappedEtherAddress) {
    owner = msg.sender;
    // only need to do this for testing purposes
    wrappedEtherAddress = _wrappedEtherAddress;
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
    require(IERC20(wrappedEtherAddress).allowance(msg.sender, address(this)) >= _triggerPrice + baseFee, "User has not approved the contract to use funds");

    bool success = IERC20(wrappedEtherAddress).transferFrom(msg.sender, address(this), _triggerPrice + baseFee);
    require(success, "failed to place assets into contract");
    buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, _triggerPrice, _collectionAddress, OrderStatus.Pending);
    orderIds[msg.sender]++;
    emit submittedNewBuyOrder(msg.sender, _collectionAddress, _triggerPrice);
  }

  function cancelOrderToBuy(uint _orderId) external {
    // dsah dvsja vdsajh d
  }

  // NEED TO CALL APPROVE FROM THE FRONT END
  // function revokeApproval() external {
  //   require(IERC20(wrappedEther).allowance(msg.sender, address(this)) != 0, "Address not currently approved!");
  //   IERC20(wrappedEther).approve(msg.sender, address(this))
  // }

  function getWrappedEtherAddress() public view returns(address) {
    return wrappedEtherAddress;
  }

  function getWETHBalance() public view returns(uint256) {
    return IERC20(wrappedEtherAddress).balanceOf(address(this));
  }

  receive() external payable {}

}