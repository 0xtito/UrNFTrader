import { ethers } from "ethers";


export default function build({orderId, attributes}) {
 let {orderStatus, collectionAddress, triggerPrice } = attributes;
 if (orderStatus == 1 ) {
  orderStatus = "Pending";
  return `
    <div class="order">
      <label> Buy Order (#${orderId})</label>
      <div class="info">
        <div class="collection">
          <strong>Collection Address</strong>: ${collectionAddress}
        </div>
        <div class="value">
          <strong>Trigger Price</strong>: ${ethers.utils.formatEther(triggerPrice)} ETH
        </div>
        <div class="order-status">
          <strong>Order Status</strong>: ${orderStatus}
        </div>
      </div>
      <div class="actions">
        <div id="cancel-${orderId}" class="button"> Cancel Order </div>
      </div>
    </div>
  `;
 } else if (orderStatus == 2 ) {
  orderStatus = "Executed";
  return `
    <div class="order">
      <label> Buy Order (#${orderId})</label>
      <div class="info">
        <div class="collection">
          <strong>Collection Address</strong>: ${collectionAddress}
        </div>
        <div class="value">
          <strong>Trigger Price</strong>: ${ethers.utils.formatEther(triggerPrice)} ETH
        </div>
        <div class="order-status">
          <strong>Order Status</strong>: ${orderStatus}
        </div>
      </div>
    </div>
  `;
 } else if (orderStatus == 3 ) {
  return;
 }

}