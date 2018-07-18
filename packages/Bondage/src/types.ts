export type address = string;
export type txid = string;
export type BondArgs = {
    provider :address,
    endpoint : string,
    zapNum :number,
    from : address,
    gas ?: number
}

export type UnbondArgs = {
	provider :address,
    endpoint : string,
    dots :number,
    from : address,
    gas ?: number
}

export type BondageArgs = {
	subscriber ?: address,
	provider: address,
	endpoint: string,
	dots ?: number ,
	zapNum ?: number
}
export type CalcBondRateType = {
    provider: address,
    endpoint: string,
    zapNum :number
}




export interface Filter {
    provider ?: address,
    fromBlock ?: number,
    toBlock ?: number
}
export type listenEvent = {
    filter ?: Filter,
    callback: Function
}
