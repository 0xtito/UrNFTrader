// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
// pragma abicoder v2;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISeaport.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

interface IMulticall {
  function aggregate(Call[] memory calls) public returns (uint256 blockNumber, bytes[] memory returnData) 
};


contract UrNFTrader is Ownable {
  // address private wrappedEther = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  // address private wrappedEtherTestnet = 0x90Ca7407b4518eA7C6480e7F92C2E166A7bcea81;
  address public wrappedEtherAddress;
  address public multicallAddress;
  address public seaportAddress = "0x00000000006c3852cbEf3e08E8dF289169EdE581";
  uint public baseFee = 15000000000000000 wei;
  // user => collection address => bool
  // mapping(address => mapping(address => bool)) approvedNFTtoUse;
  // mapping(address => mapping(address => bool)) approvedEthToUse;
  // user => orderID => BuyOrder struct
  mapping(address => mapping(uint => BuyOrder)) public buyOrderBook;
  // user => total Number of Orders (can loop through to find the current contract address)
  mapping(address => uint) public orderIds;
  mapping(address => bool) public isApprovedERC20;

  enum OrderStatus { Inactive, Pending, Executed, Canceled}

  struct BuyOrder {
    address owner;
    uint triggerPrice;
    address collectionAddress;
    OrderStatus orderStatus;
    uint orderId;
  }

  struct Call {
    address target,
    bytes callData   
  }

  constructor(address _wrappedEtherAddress, address _multicallAddress) {
    // only need to do this for testing purposes
    wrappedEtherAddress = _wrappedEtherAddress;
    multicallAddress = _multicallAddress;
  }

  event submittedNewBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId, uint triggerPrice);
  event executedBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId, uint tokenId);
  // event submittedNewBuyOrder( BuyOrder currentBuyOrder, uint indexed orderId);
  event submitPriceToSell(address indexed addr, address indexed collectionAddress, uint indexed triggerPrice);
  event canceledBuyOrder(address indexed addr, address indexed collectionAddress);
  event canceledSellOrder(address indexed addr, address indexed collectionAddress);


  // using WETH
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
    buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, _triggerPrice, _collectionAddress, OrderStatus.Pending, orderIds[msg.sender]);
    emit submittedNewBuyOrder(msg.sender, _collectionAddress, orderIds[msg.sender], _triggerPrice);
    orderIds[msg.sender]++;
  }

  // using ETH
  //   function setPriceToBuy(address _collectionAddress) external payable {
  //   (bool success, ) = address(this).call{value: msg.value + baseFee}("");
  //   require(success, "failed to place assets into contract");
  //   buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, msg.value, _collectionAddress, OrderStatus.Pending, orderIds[msg.sender]);
  //   emit submittedNewBuyOrder(msg.sender, _collectionAddress, orderIds[msg.sender], msg.value);
  //   orderIds[msg.sender]++;
  // }

  // TODO
  // GET THE ORDER ORDER PARAMETERS FROM THE FRONT END
  function executeBuyOrder(address _user, uint _orderId, uint _purchasePrice, uint _tokenId, BasicOrderParameters calldata parameters) external orderIsLive(_user, _orderId) returns(bytes[]) {
    // (bool success, ) = wrappedEtherAddress.call(abi.encodeWithSignature("withdraw(uint256)", _purchasePrice));
    // require(success, 'could not unwrap ETH');
    // require(IERC20(wrappedEtherAddress).balanceOf(address(this)) = ogBalance - _purchasePrice, "Do not have enough ETH");
    // ISeaport(seaportAddress).

    Call[] memory callData = new Call[](3);

    callData[0] = Call(wrappedEtherAddress, abi.encodeWithSignature("withdraw(uint256)", _purchasePrice));
    // callData[1] = Call(seaportAddress, abi.encodeWithSignature("fulfillAdvancedOrder((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256, address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),uint120,uint120,bytes,bytes)",));
    callData[1] = Call(seaportAddress, abi.encodeWithSignature("fulfillBasicOrder((address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes))", parameters));
    // transfer NFT to user
    // callData[2] = Call()

    (uint blockNumber, bytes[] returnData) = IMulticall(multicallAddress).aggregate([callData[0], callData[1]]);

    buyOrderBook[_user][_orderId].orderStatus = OrderStatus.Executed;
    emit executedBuyOrder(_user, buyOrderBook[_user][_orderId].collectionAddress, _orderId, _tokenId);

    return returnData;
  }

  modifier orderIsLive(address _user, uint _orderId) {
    require(buyOrderBook[_user][_orderId].orderStatus == OrderStatus.Pending && buyOrderBook[_user][_orderId].triggerPrice != 0, "Order is Pending");
    _;
  }

  // with WETH
  function cancelOrderToBuy(uint _orderId) external orderIsLive(msg.sender, _orderId) {
    buyOrderBook[msg.sender][_orderId].orderStatus = OrderStatus.Canceled;
    bool success = IERC20(wrappedEtherAddress).transferFrom(address(this), msg.sender, buyOrderBook[msg.sender][_orderId].triggerPrice + baseFee);
    require(success, "failed to place assets into contract");
    emit canceledBuyOrder(msg.sender, buyOrderBook[msg.sender][_orderId].collectionAddress);
  }

  // // With ETH
  // function cancelOrderToBuy(uint _orderId) external {
  //   require(buyOrderBook[msg.sender][_orderId].owner != address(0) && buyOrderBook[msg.sender][_orderId].triggerPrice != 0 && buyOrderBook[msg.sender][_orderId].collectionAddress != address(0) && buyOrderBook[msg.sender][_orderId].orderStatus != OrderStatus.Inactive, 'order does not exist');
  //   uint returnValue = buyOrderBook[msg.sender][_orderId].triggerPrice + baseFee;
  //   buyOrderBook[msg.sender][_orderId].triggerPrice = 0;
  //   (bool success, ) = payable(msg.sender).call{value: returnValue }("");
  //   require(success, "tx failed");
  //   buyOrderBook[msg.sender][_orderId].orderStatus = OrderStatus.Canceled;
  //   emit canceledBuyOrder(msg.sender, buyOrderBook[msg.sender][_orderId].collectionAddress);
  // }

  // NEED TO CALL APPROVE FROM THE FRONT END
  // function revokeApproval() external {
  //   require(IERC20(wrappedEther).allowance(msg.sender, address(this)) != 0, "Address not currently approved!");
  //   IERC20(wrappedEther).approve(msg.sender, address(this))
  // }

  function setWrappedEtherAddress(address _wrappedEtherAddress) public onlyOwner() returns(address) {
    wrappedEtherAddress = _wrappedEtherAddress;
    return wrappedEtherAddress;
  }

  function setBaseFee(uint _fee) external onlyOwner() returns(uint) {
    baseFee = _fee;
    return baseFee;
  }

  // function getWETHBalance() public view returns(uint256) {
  //   return IERC20(wrappedEtherAddress).balanceOf(address(this));
  // }

  function retrieveBuyOrderHistory() external view returns(BuyOrder[] memory) {
    require(orderIds[msg.sender] != 0, 'Have never placed a buy order');

    BuyOrder[] memory buyOrders = new BuyOrder[](orderIds[msg.sender]);
    
    for (uint i = 0; i < orderIds[msg.sender]; i++) {
        buyOrders[i] = buyOrderBook[msg.sender][i];
    }
    return buyOrders;

  }

  function withdraw() external onlyOwner() {
    address _to = payable(msg.sender);
    (bool success, ) = _to.call{value: address(this).balance}("");
    require(success, 'tx failed');
  }

  receive() external payable {}

  function closeContract() external onlyOwner() {
    selfdestruct(payable(msg.sender));
  }

}