  /*
  fulfill order takes:
  fulfillOrder({ order, unitsToFill, offerCriteria, considerationCriteria, tips, extraData, accountAddress, conduitKey, recipientAddress, }: {
        order: OrderWithCounter;
        unitsToFill?: BigNumberish;
        offerCriteria?: InputCriteria[];
        considerationCriteria?: InputCriteria[];
        tips?: TipInputItem[];
        extraData?: string;
        accountAddress?: string;
        conduitKey?: string;
        recipientAddress?: string;
    }): Promise<OrderUseCase<ExchangeAction<ContractMethodReturnType<SeaportContract, "fulfillBasicOrder" | "fulfillOrder" | "fulfillAdvancedOrder">>>>;

  export declare type OrderWithCounter = {
    parameters: OrderComponents;
    signature: string;
  };
  which is essentially OrderParameters, counter, signature
  with the orderComponents being:
  export declare type OrderParameters = {
    offerer: string;
    zone: string;
    orderType: OrderType;
    startTime: BigNumberish;
    endTime: BigNumberish;
    zoneHash: string;
    salt: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    totalOriginalConsiderationItems: BigNumberish;
    conduitKey: string;
};
export declare type OrderComponents = OrderParameters & {
    counter: number;
};
type OfferItem = {
    itemType: ItemType;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
}
type ConsiderationItem = {
    itemType: ItemType;
    token: string;
    identifierOrCriteria: string;
    startAmount: string;
    endAmount: string;
    recipient: string;
}
  */