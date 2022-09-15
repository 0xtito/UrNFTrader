// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;
pragma abicoder v2;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import { SeaportInterface } from "../contracts/ISeaport.sol";
import { AdvancedOrder, OfferItem, ConsiderationItem, OrderType } from "../contracts/ConsiderationStructs.sol";
import { IMulticall3 } from "./test/mocks/IMulticall3.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


/*
TODO:
FIGURE OUT HOW TO CREATE THE STRUCT INHERETED FROM IMULTICALL
*/

contract UrNFTrader is Ownable, ERC721Holder {
  IMulticall3 multicall;
  SeaportInterface ISeaport;

  address public wrappedEtherAddress;
  address public multicallAddress;
  address public seaportAddress = 0x00000000006c3852cbEf3e08E8dF289169EdE581;
  uint public baseFee = 15000000000000000 wei;

  mapping(address => mapping(uint => BuyOrder)) public buyOrderBook;
  // user => total Number of Orders (can loop through to find the current contract address)
  mapping(address => uint) public orderIds;
  mapping(address => bool) public isApprovedERC20;

  enum OrderStatusMain { Inactive, Pending, Executed, Canceled}

  struct BuyOrder {
    address owner;
    uint triggerPrice;
    address collectionAddress;
    OrderStatusMain orderStatus;
    uint orderId;
  }
  
  
  constructor() {
    // only need to do this for testing purposes

  }

  event submittedNewBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId, uint triggerPrice);
  event executedBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed tokenId);
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
    buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, _triggerPrice, _collectionAddress, OrderStatusMain.Pending, orderIds[msg.sender]);
    emit submittedNewBuyOrder(msg.sender, _collectionAddress, orderIds[msg.sender], _triggerPrice);
    orderIds[msg.sender]++;
  }

  // TODO
  // GET THE ORDER ORDER PARAMETERS FROM THE FRONT END
  event CheckBytesArray(bytes[] indexed _bytesArray);
  function executeBuyOrder(address _user, uint _orderId, uint _tokenId, bytes calldata _fulfullAdvancedOrder) external payable orderIsLive(_user, _orderId) onlyOwner() returns(bytes memory, IMulticall3.Call3Value[] memory) {
    // require(success, 'could not unwrap ETH');
    // require(IERC20(wrappedEtherAddress).balanceOf(address(this)) = ogBalance - _purchasePrice, "Do not have enough ETH");
    // ISeaport(seaportAddress).

    IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](1);
    bytes memory order = _fulfullAdvancedOrder;

    // calls[0] = IMulticall3.Call3Value()
  
    // // Create calldata for each execution
    // Call[] memory calldatas = new Call[](3);
    // // swap ETH for WETH
    // calldatas[0] = Call(wrappedEtherAddress, abi.encodeWithSignature("withdraw(uint256)", buyOrderBook[_user][_orderId].triggerPrice));
    // // Buy NFT
    // calldatas[1] = Call(seaportAddress, _fulfullAdvancedOrder);
    // // Approve Multicalll contract to send nft
    // // calldatas[3] = Call(buyOrderBook[_user][_orderId].collectionAddress, abi.encodeWithSignature(""))
    // // Send NFT to user
    // calldatas[3] = Call(buyOrderBook[_user][_orderId].collectionAddress, abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", address(this), _user, _tokenId));


    // Call Multicall
    // (uint blockNumber, bytes[] memory returnData) = IMulticall(multicallAddress).aggregate(calldatas);
    // emit CheckBytesArray(returnData);
    // require(blockNumber == block.number, 'Transaction not done in the same block');

    buyOrderBook[_user][_orderId].orderStatus = OrderStatusMain.Executed;
    emit executedBuyOrder(_user, buyOrderBook[_user][_orderId].collectionAddress, _tokenId);

    return (order, calls);
  }

  modifier orderIsLive(address _user, uint _orderId) {
    require(buyOrderBook[_user][_orderId].orderStatus == OrderStatusMain.Pending && buyOrderBook[_user][_orderId].triggerPrice != 0, "Order is Pending");
    _;
  }

  // with WETH
  function cancelOrderToBuy(uint _orderId) external orderIsLive(msg.sender, _orderId) {
    buyOrderBook[msg.sender][_orderId].orderStatus = OrderStatusMain.Canceled;
    bool success = IERC20(wrappedEtherAddress).transferFrom(address(this), msg.sender, buyOrderBook[msg.sender][_orderId].triggerPrice + baseFee);
    require(success, "failed to place assets into contract");
    emit canceledBuyOrder(msg.sender, buyOrderBook[msg.sender][_orderId].collectionAddress);
  }

  function setWrappedEtherAddress(address _wrappedEtherAddress) public onlyOwner() returns(address) {
    wrappedEtherAddress = _wrappedEtherAddress;
    return wrappedEtherAddress;
  }

  function setMulticallAddress(address _multicallAddress) public onlyOwner() returns(address) {
    multicallAddress = _multicallAddress;
    return multicallAddress;
  }

  function setBaseFee(uint _fee) external onlyOwner() returns(uint) {
    baseFee = _fee;
    return baseFee;
  }

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