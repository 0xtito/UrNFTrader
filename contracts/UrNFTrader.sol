// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;
pragma abicoder v2;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import { IERC20 } from "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { SeaportInterface } from "../contracts/ISeaport.sol";
import { AdvancedOrder, OfferItem, ConsiderationItem, OrderType, CriteriaResolver} from "./ConsiderationStructs.sol";
import { IMulticall3 } from "./IMulticall3.sol";
// import { IConsiderationStructs } from "../contracts/IConsiderationStructs.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "hardhat/console.sol";

contract UrNFTrader is Ownable, ERC721Holder {
  // Interfaces
  // IMulticall3 multicall;
  SeaportInterface ISeaport;
  // IConsiderationStructs SeaportStructs;
  // IERC20 erc20;

  // Structs and Enums
  // AdvancedOrder advancedOrder;
  // OfferItem offerItem;
  // ConsiderationItem considerationItem;
  // OrderType orderType;
  // CriteriaResolver criteriaResolver;

  // address public wrappedEtherAddress;
  address public multicallAddress;
  address public seaportAddress = 0x00000000006c3852cbEf3e08E8dF289169EdE581;
  // uint public baseFee = 15000000000000000 wei;
  uint public baseFee = 0.015 ether;


  mapping(address => mapping(uint => BuyOrder)) public buyOrderBook;
  // user => total Number of Orders (can loop through to find the current contract address)
  mapping(address => uint) public orderIds;
  // mapping(address => bool) public isApprovedERC20;
  CriteriaResolver[] criteriaResolverArr;

  enum OrderStatusMain { Inactive, Pending, Executed, Canceled, Refund, Failed}

  struct BuyOrder {
    address owner;
    uint triggerPrice;
    address collectionAddress;
    OrderStatusMain orderStatus;
    uint orderId;
    bool refundNeeded;
    uint refundAmount;
  }

  struct ExtraOrderInfo {
    address user;
    uint orderId;
    uint purchasePrice;
    uint tokenId;
  }
  
  
  constructor() {
    // only need to do this for testing purposes

  }

  event SubmittedNewBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId, uint triggerPrice);
  event ExecutedBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed tokenId);
  // event submittedNewBuyOrder( BuyOrder currentBuyOrder, uint indexed orderId);
  event SubmitPriceToSell(address indexed addr, address indexed collectionAddress, uint indexed triggerPrice);
  event CanceledBuyOrder(address indexed addr, address indexed collectionAddress);
  event CanceledSellOrder(address indexed addr, address indexed collectionAddress);
  event EligibleForRefund(address indexed addr, uint orderId, uint indexed refundAmount);
  event GivenRefund(address indexed addr, uint orderId, uint indexed refundAmount);
  event OrderFailed(address indexed addr, address indexed collectionAddress, uint orderId);


  // using ETH
  function setPriceToBuy(address _collectionAddress) payable external {
    /*
      Steps:
      1) Check for approval
      2) Set Order
      3) emit new Order
    */
    require(msg.value - baseFee < baseFee, 'trigger price too low');
    buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, msg.value - baseFee, _collectionAddress, OrderStatusMain.Pending, orderIds[msg.sender], false, 0);
    emit SubmittedNewBuyOrder(msg.sender, _collectionAddress, orderIds[msg.sender], msg.value - baseFee);
    orderIds[msg.sender]++;
  }

  // TODO
  // GET THE ORDER ORDER PARAMETERS FROM THE FRONT END

  function executeBuyOrder(ExtraOrderInfo calldata _orderInfo,  bytes calldata orderParams) external payable orderIsLiveOrFailed(_orderInfo.user, _orderInfo.orderId) onlyOwner returns(bool completedPurchase) {

    // address user, uint orderId, uint256 purchasePrice,

    BuyOrder memory currentOrder = buyOrderBook[_orderInfo.user][_orderInfo.orderId];

    // console.log(purchasePrice);

    (AdvancedOrder memory _advancedOrder, CriteriaResolver memory _criteriaResolver, bytes32 _fulfillerConduitKey, address _recipient) = abi.decode(orderParams, (AdvancedOrder, CriteriaResolver, bytes32, address));
    // CriteriaResolver[] memory criteriaResolverArrTest = _criteriaResolver;
    if (criteriaResolverArr.length == 1) {
      criteriaResolverArr.pop();
    }
    criteriaResolverArr.push(_criteriaResolver);
    // criteriaResolverArrTest.push(_criteriaResolver);


    bool fulfilled = SeaportInterface(seaportAddress).fulfillAdvancedOrder{value: _orderInfo.purchasePrice}(_advancedOrder, criteriaResolverArr, _fulfillerConduitKey, _recipient);

    if (fulfilled) {
      if (currentOrder.triggerPrice - _orderInfo.purchasePrice > 0.005 ether) {
        (bool success,) = _orderInfo.user.call{value: currentOrder.triggerPrice - _orderInfo.purchasePrice}("");
        if (success) {
          currentOrder.orderStatus = OrderStatusMain.Executed;
          emit ExecutedBuyOrder(_orderInfo.user, currentOrder.collectionAddress, _orderInfo.tokenId);
        } else {
          currentOrder.refundNeeded = true;
          currentOrder.orderStatus = OrderStatusMain.Refund;
          emit EligibleForRefund(_orderInfo.user, _orderInfo.orderId, currentOrder.triggerPrice - _orderInfo.purchasePrice);
        }   
      } else {
        currentOrder.orderStatus = OrderStatusMain.Executed;
        emit ExecutedBuyOrder(_orderInfo.user, currentOrder.collectionAddress, _orderInfo.tokenId);
      }
    } else {
      currentOrder.orderStatus = OrderStatusMain.Failed;
      emit OrderFailed(_orderInfo.user, currentOrder.collectionAddress, _orderInfo.orderId);
    }
    return fulfilled;


  }

  modifier orderIsLiveOrFailed(address _user, uint _orderId) {
    require(buyOrderBook[_user][_orderId].orderStatus == OrderStatusMain.Pending || buyOrderBook[_user][_orderId].orderStatus == OrderStatusMain.Failed, "Order is not considered pending, failed, or the user has not made  ");
    _;
  }

  // with WETH
  function cancelOrderToBuy(uint orderId) external orderIsLiveOrFailed(msg.sender, orderId) {
    uint refund = buyOrderBook[msg.sender][orderId].triggerPrice;
    buyOrderBook[msg.sender][orderId].triggerPrice = 0;
    (bool success, ) = msg.sender.call{value: refund}("");
    require(success, "failed to return ETH");
    buyOrderBook[msg.sender][orderId].orderStatus = OrderStatusMain.Canceled;
    emit CanceledBuyOrder(msg.sender, buyOrderBook[msg.sender][orderId].collectionAddress);
  }

  // function setWrappedEtherAddress(address _wrappedEtherAddress) public onlyOwner returns(address) {
  //   wrappedEtherAddress = _wrappedEtherAddress;
  //   return wrappedEtherAddress;
  // }

  function setMulticallAddress(address _multicallAddress) public onlyOwner returns(address) {
    multicallAddress = _multicallAddress;
    return multicallAddress;
  }

  function setBaseFee(uint _fee) external onlyOwner returns(uint) {
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

  function retrieveRefund(uint orderId) external onlyRefund(orderId) {
    (bool success, ) = msg.sender.call{value: buyOrderBook[msg.sender][orderId].refundAmount}("");
    require(success, "tx failed");
    buyOrderBook[msg.sender][orderId].orderStatus = OrderStatusMain.Executed;
    emit GivenRefund(msg.sender, orderId, buyOrderBook[msg.sender][orderId].refundAmount);
  }

  function withdraw() external onlyOwner {
    address _to = payable(msg.sender);
    (bool success, ) = _to.call{value: address(this).balance}("");
    require(success, 'tx failed');
  }

  receive() external payable {}

  modifier onlyRefund(uint orderId) {
    require(buyOrderBook[msg.sender][orderId].refundNeeded);
    _;
  }

  function closeContract() external onlyOwner {
    selfdestruct(payable(msg.sender));
  }

}


/*
under the executeBuyOrder function
    // IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](2);
    // bool fulfilled = ISeaport(seaportAddress).fulfillAdvancedOrder{value: purchasePrice}(_advancedOrder,_criteriaResolver, _fulfillerConduitKey,_recipient);
    // require(fulfilled, "FulfillAdvancedOrder failed");

    // calls[0] = IMulticall3.Call3Value(seaportAddress, false, purchasePrice, orderParams);
    // calls[1] = IMulticall3.Call3Value(user, true, refundAmount, abi.encode(user.call{value: refundAmount}("")));
    // IMulticall3(multicallAddress).aggregate3Value{value: refundAmount + purchasePrice}(calls);


  // IMulticall3.Call3Value[] memory calls = new IMulticall3.Call3Value[](3);
  // bytes memory order = _fulfullAdvancedOrder;

  // calls[0] = IMulticall3.Call3Value()

  // // Create calldata for each execution
  // Call[] memory calldatas = new Call[](3);
  // // swap WETH for ETH
  // calls[0] = IMulticall3.Call3Value(wrappedEtherAddress, false, 0, abi.encodeWithSignature("withdraw(uint256)", purchasePrice));


  // // Buy NFT
  // calls[1] = IMulticall3.Call3Value(wrappedEtherAddress, false, 1 ether, abi.encodeWithSignature("deposit()"));
  // // Approve Multicalll contract to send nft
  // // calldatas[3] = Call(buyOrderBook[_user][_orderId].collectionAddress, abi.encodeWithSignature(""))
  // // Send NFT to user
  // calldatas[3] = Call(buyOrderBook[_user][_orderId].collectionAddress, abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", address(this), _user, _tokenId));


  // Call Multicall
  // (uint blockNumber, bytes[] memory returnData) = IMulticall(multicallAddress).aggregate(calldatas);
  // emit CheckBytesArray(returnData);
  // require(blockNumber == block.number, 'Transaction not done in the same block');

  // if using WETH
    using WETH
    function setPriceToBuy(uint _triggerPrice, address _collectionAddress) external {
      //   Steps:
      //   1) Check for approval
      //   2) Set Order
      //   3) emit new Order
      require(IERC20(wrappedEtherAddress).allowance(msg.sender, address(this)) >= _triggerPrice + baseFee, "User has not approved the contract to use funds");

      bool success = IERC20(wrappedEtherAddress).transferFrom(msg.sender, address(this), _triggerPrice + baseFee);
      require(success, "failed to place assets into contract");
      bool success2 = IERC20(wrappedEtherAddress).withdraw();
      buyOrderBook[msg.sender][orderIds[msg.sender]] = BuyOrder(msg.sender, _triggerPrice, _collectionAddress, OrderStatusMain.Pending, orderIds[msg.sender]);
      emit submittedNewBuyOrder(msg.sender, _collectionAddress, orderIds[msg.sender], _triggerPrice);
      orderIds[msg.sender]++;
*/
