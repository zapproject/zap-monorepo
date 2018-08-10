import {address,BNType} from "@zapjs/types"
export interface SubscriptionInit {
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number,
    pubkey:number,
    from: address,
    gas?: BNType
}

export interface SubscriptionEnd {
    provider?:address,
    subscriber ?:address,
    endpoint : string,
    from: address,
    gas?:BNType
}

export interface SubscriptionType {
    provider:address,
    subscriber:address,
    endpoint:string
}