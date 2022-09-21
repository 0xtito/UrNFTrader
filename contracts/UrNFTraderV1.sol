// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import { SeaportInterface } from "../contracts/ISeaport.sol";
import { AdvancedOrder, OfferItem, ConsiderationItem, OrderType, CriteriaResolver} from "./ConsiderationStructs.sol";

/**
 * @title UrNFTrader
 * @author 0xtito
 * @notice UrNFTraderV1 is the first iteration of a NFT (ERC-721) exchange operating
 *         through the Seaport protocol. Currently, users are able to set buy limit
 *         orders for specific NFT collections and their orders will be executed
 *         when an NFT from the specified collection is listed at or below their
 *         set trigger price.
 */
contract UrNFTraderV1 is Ownable {

  address public seaportAddress = 0x00000000006c3852cbEf3e08E8dF289169EdE581;
  uint public baseFee = 0.015 ether;
  uint public pendingOrdersETHAmount;

  mapping(address => mapping(uint => BuyOrder)) private buyOrderBook;
  mapping(address => uint) public totalOrders;

  enum OrderStatusMain { Inactive, Pending, Executed, Canceled, OwedETH, Failed}

  struct BuyOrder {
    address owner;
    uint triggerPrice;
    address collectionAddress;
    OrderStatusMain orderStatus;
    uint orderId;
    bool isOwedETH;
    uint amountOwed;
  }

  struct ExtraOrderInfo {
    address user;
    uint orderId;
    uint purchasePrice;
    uint tokenId;
  }

  event SubmittedNewBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId);
  event ExecutedBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed tokenId);
  event CanceledBuyOrder(address indexed addr, address indexed collectionAddress, uint indexed orderId);
  event CanceledSellOrder(address indexed addr, address indexed collectionAddress);
  event OwedLeftoverFunds(address indexed addr, uint orderId, uint indexed refundAmount);
  event GivenRefund(address indexed addr, uint orderId, uint indexed refundAmount);
  event OrderFailed(address indexed addr, address indexed collectionAddress, uint orderId);
  event WithdrewFunds(uint indexed amount);
  event Deposit(address indexed sender, uint indexed amount);

  /**
   * @notice Set the buy limit order. The trigger price specifies their trigger
   *         price and they send that value + the base fee in ETH to the contract.
   * 
   * @param collectionAddress   The contract address of the NFT collection you
   *                            would like to buy a NFT from.
   */
  function setPriceToBuy(address collectionAddress) payable external {
    require(msg.value - baseFee > baseFee, "trigger price too low");
    buyOrderBook[msg.sender][totalOrders[msg.sender]] = BuyOrder(msg.sender, msg.value - baseFee, collectionAddress, OrderStatusMain.Pending, totalOrders[msg.sender], false, 0);
    pendingOrdersETHAmount += msg.value - baseFee;
    emit SubmittedNewBuyOrder(msg.sender, collectionAddress, totalOrders[msg.sender]);
    totalOrders[msg.sender]++;
  }

  /**
   * @notice This is where the main functionality of the exchange resides. The
   *         function recieves the orderInfo and orderParams from the server, decodes
   *         the orderParams, and buys the NFT through Seaport. If the order is 
   *         fulfilled, the user will recieve the NFT and the difference between
   *         the purchase price and the trigger price in ETH. If the order is not
   *         fulfilled, the order status will update to failed. If the order is
   *         fulfilled but the ETH transfer fails, the user will be able to
   *         retrieve their leftover funds at any point.
   * @param orderInfo           The necessary order information for the contract to
   *                            retrieve and execute the correct buy order.
   * @param orderParams         The order parameters for the function
   *                            fulfillAdvancedOrder in the Seaport contract. The
   *                            parameters are sent as bytes and then decoded into
   *                            the necessary parameters. For a more detailed
   *                            description of the parameters, look at
   *                            Consideration.sol which can be found at
   *                            https://github.com/ProjectOpenSea/seaport      
   */
  function executeBuyOrder(ExtraOrderInfo calldata orderInfo,  bytes calldata orderParams) external payable onlyOwner orderIsPendingOrFailed(orderInfo.user, orderInfo.orderId) {

    BuyOrder storage currentOrder = buyOrderBook[orderInfo.user][orderInfo.orderId];

    (AdvancedOrder memory _advancedOrder, CriteriaResolver[] memory _criteriaResolver, bytes32 _fulfillerConduitKey, address _recipient) = abi.decode(orderParams, (AdvancedOrder, CriteriaResolver[], bytes32, address));

    bool fulfilled = SeaportInterface(seaportAddress).fulfillAdvancedOrder{value: orderInfo.purchasePrice}(_advancedOrder, _criteriaResolver, _fulfillerConduitKey, _recipient);

    if (fulfilled) {
      (bool success,) = orderInfo.user.call{value: currentOrder.triggerPrice - orderInfo.purchasePrice}("");
      if (success) {
        pendingOrdersETHAmount -= currentOrder.triggerPrice;
        currentOrder.orderStatus = OrderStatusMain.Executed;
        emit ExecutedBuyOrder(orderInfo.user, currentOrder.collectionAddress, orderInfo.tokenId);
      } else {
        currentOrder.isOwedETH = true;
        currentOrder.amountOwed = currentOrder.triggerPrice - orderInfo.purchasePrice;
        pendingOrdersETHAmount -= orderInfo.purchasePrice;
        currentOrder.orderStatus = OrderStatusMain.OwedETH;
        emit OwedLeftoverFunds(orderInfo.user, orderInfo.orderId, currentOrder.triggerPrice - orderInfo.purchasePrice);
      }   
    } else {
      currentOrder.orderStatus = OrderStatusMain.Failed;
      emit OrderFailed(orderInfo.user, currentOrder.collectionAddress, orderInfo.orderId);
    }

  }
  /**
   * @notice Cancels a buy order. This can only be called by the owner of the
   *         contract or by the user who created the buy order. When canceling,
   *         the user recieves a full refund (including the base fee).
   * @param orderId             The order identifier.
   */
  function cancelOrderToBuy(uint orderId) external orderIsPendingOrFailed(msg.sender, orderId) onlyUserOrOwner(msg.sender, orderId) {
    uint owed = buyOrderBook[msg.sender][orderId].triggerPrice + baseFee;
    buyOrderBook[msg.sender][orderId].triggerPrice = 0;
    (bool success, ) = msg.sender.call{value: owed}("");
    require(success, "failed to return ETH");
    pendingOrdersETHAmount -= buyOrderBook[msg.sender][orderId].triggerPrice;
    buyOrderBook[msg.sender][orderId].orderStatus = OrderStatusMain.Canceled;
    emit CanceledBuyOrder(msg.sender, buyOrderBook[msg.sender][orderId].collectionAddress, orderId);
  }

  /**
   * @notice The function that will reimburse the user in the case where the ETH 
   *         transfer failed.
   * @param orderId             The order Identifier.
   */
  function retrieveLeftover(uint orderId) external onlyOwed(orderId) onlyUserOrOwner(msg.sender, orderId) {
    uint owed = buyOrderBook[msg.sender][orderId].amountOwed;
    buyOrderBook[msg.sender][orderId].amountOwed = 0;
    (bool success, ) = msg.sender.call{value: owed}("");
    require(success, "tx failed");
    pendingOrdersETHAmount -= owed;
    buyOrderBook[msg.sender][orderId].orderStatus = OrderStatusMain.Executed;
    buyOrderBook[msg.sender][orderId].isOwedETH = false;
    emit GivenRefund(msg.sender, orderId, buyOrderBook[msg.sender][orderId].amountOwed);
  }

  /**
   * @notice Changes the base fee. Can only be called by the contract owner.
   * @param _baseFee            The new base fee.
   */
  function setBaseFee(uint _baseFee) external onlyOwner returns(uint) {
    baseFee = _baseFee;
    return baseFee;
  }

  /**
   * @notice Withdraws all of the ETH to the owner. Can only be called by the
   *         contract owner. The value "pendingOrdersETHAmount" allows the owner to
   *         withdraw all funds except for the ETH neccesary to execute the current
   *         pending buy orders. 
   */
  function withdraw() external onlyOwner {
    address _to = payable(msg.sender);
    (bool success, ) = _to.call{value: address(this).balance - pendingOrdersETHAmount}("");
    require(success, "tx failed");
    emit WithdrewFunds(pendingOrdersETHAmount);
  }

  /**
   * @notice Retrieves the buy order. Usually used by the server to get the correct
   *         order. A user can also call this to retrieve their own order
   *         information. Access is restricted to the owner and the user themselves
   *         to keep orders private.
   * @param userAddress         The address of the user.
   * @param orderId             The order identifier.
   * @return buyOrder           The specified buy order containing the user's
   *                            address, the trigger price, the NFT collection
   *                            address, the order status, the order id, whether
   *                            the user is owed any ETH, and the amount of ETH
   *                            owed.
   */
  function getBuyOrder(address userAddress, uint orderId) external view onlyUserOrOwner(userAddress, orderId) returns (BuyOrder memory buyOrder) {
    buyOrder = buyOrderBook[userAddress][orderId];
  }

  /**
   * @dev Checks to see if the caller is either the specified user or the owner.
   */
  modifier onlyUserOrOwner(address userAddress, uint orderId) {
    require(buyOrderBook[userAddress][orderId].owner == msg.sender || msg.sender == owner(), "Not the user or owner");
    _;
  }

  /**
   * @dev Checks to see if the order is either pending or failed.
   */
  modifier orderIsPendingOrFailed(address _user, uint _orderId) {
    require(buyOrderBook[_user][_orderId].orderStatus == OrderStatusMain.Pending || buyOrderBook[_user][_orderId].orderStatus == OrderStatusMain.Failed, "Order is not considered pending, failed, or the user has not made  ");
    _;
  }

  /**
   * @dev Checks if the caller is owed any ETH.
   */
  modifier onlyOwed(uint orderId) {
    require(buyOrderBook[msg.sender][orderId].isOwedETH || msg.sender == owner(), "Not the owner, user, or there is no reimbursement needed");
    _;
  }

  /**
   * @dev Destroys the contract and sends the contract's to the owner. Can only
   *      be called by the contract's owner. 
   */
  function closeContract() external onlyOwner {
    selfdestruct(payable(msg.sender));
  }

  /**
   * @dev Allows the contract to recieve ETH.
   */
  receive() external payable {
    emit Deposit(msg.sender, msg.value);
  }
}
