import {defaultTx,address,BNType,NumType} from "@zapjs/types"

export interface BondType extends defaultTx {
    subscriber ?:address,
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface DelegateBondType extends BondType {
    subscriber :address
}
export interface UnbondType extends defaultTx{
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface SubscribeType extends defaultTx {
    provider:address,
    endpoint:string,
    dots : NumType,
    endpointParams : string[]
}
export type SubscriberConstructorType = {
  owner:address,
  handler ?: any
}

export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}

export interface QueryArgs extends defaultTx{
  provider: address,
  endpoint: string,
  query: string,
  endpointParams : Array<string>
}
