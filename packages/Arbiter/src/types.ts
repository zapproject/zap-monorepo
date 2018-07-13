const DEFAULT_GAS = 400000
export type SubscriptionInit = {
    provider:string,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number,
    pubkey:number,
    from: string,
    gas?: number
}

export type SubscriptionEnd = {
    provider:string,
    endpoint : string,
    from: string,
    gas?:number
}

export type Filter = {
    fromBlock ?: number,
    toBlock ?: number,
    provider ?: string
}

