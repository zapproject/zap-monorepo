const DEFAULT_GAS = 400000
export type SubscriptionInit = {
    provider:string,
    endpoint :string,
    endpointParams: Array<string>,
    blocks : number,
    publicKey:number,
    from: string,
    gas?: number
}

export type SubscriptionEnd = {
    provider:string,
    endpoint : string,
    from: string,
    gas?:number
}

