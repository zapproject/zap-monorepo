import {address,BNType} from "@zapjs/types"
export interface SubscriptionInit {
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number|string,
    pubkey:number|string,
    from: address,
    gas?: BNType|string|number
}

export interface SubscriptionEnd {
    provider?:address,
    subscriber ?:address,
    endpoint : string,
    from: address,
    gas?:BNType|string|number
}

export interface SubscriptionType {
    provider:address,
    subscriber:address,
    endpoint:string
}

export interface SubscriptionParams {
    receiver:address,
    endpoint:string,
    params: Array<string>,
    from: address,
    gas?: BNType|string|number
}
