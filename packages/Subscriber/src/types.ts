export type BondType = {
    provider:string,
    endpoint:string,
    zapNum :number
}
export type UnbondType = {
    provider:string,
    endpoint:string,
    dots :number
}

export type SubscribeType= {
    provider:string,
    endpoint:string,
    dots :number,
    endpointParams : string[]
}
