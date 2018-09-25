import {address,BNType, defaultTx} from "@zapjs/types"

export interface SubscriptionInit extends defaultTx{
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number|string,
    pubkey:number|string,
    from: address
}

export interface SubscriptionEnd extends defaultTx{
    provider?:address,
    subscriber ?:address,
    endpoint : string
}

export interface SubscriptionType {
    provider:address,
    subscriber:address,
    endpoint:string
}

export interface SubscriptionParams  extends defaultTx{
    receiver:address,
    endpoint:string,
    params: Array<string>
}
