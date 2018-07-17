const DEFAULT_GAS = 400000
export type address = string
export type txid = string
export type SubscriptionInit = {
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number,
    pubkey:number,
    from: address,
    gas?: number
}

export type SubscriptionEnd = {
    provider?:address,
    subscriber ?:address,
    endpoint : string,
    from: address,
    gas?:number
}

export interface Filter {
    fromBlock ?: number,
    toBlock ?: number,
    provider ?: address,
    subscriber ?:address,
    terminator ?:address
}

export type SubscriptionType = {
    provider:address,
    subscriber:address,
    endpoint:string
}

