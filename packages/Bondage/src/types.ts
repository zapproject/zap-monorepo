export type BondageArgs = {
    provider ?:string,
    subscriber ?:string,
    endpoint ?: string,
    zapNum?:number,
    dots ?: number,
    from ?: string,
    gas ?: number
}

export type listenEvent = {
    filter ?: any,
    callback: Function
}
