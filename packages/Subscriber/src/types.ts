import {defaultTx} from "@zapjs/types"

export interface BondType extends defaultTx {
    provider:string,
    endpoint:string,
    dots :number|string
}
export interface UnbondType extends defaultTx{
    provider:string,
    endpoint:string,
    dots :number|string
}

export interface SubscribeType extends defaultTx {
    provider:string,
    endpoint:string,
    dots :number|string,
    endpointParams : string[]
}
export type SubscriberConstructorType = {
  owner:string,
  handler ?: any
}

export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}

export interface QueryArgs extends defaultTx{
  provider: string,
  endpoint: string,
  query: string,
  endpointParams : Array<string>
}
