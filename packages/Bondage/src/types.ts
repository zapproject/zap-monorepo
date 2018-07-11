export type BondArgs = {
    provider :string,
    endpoint : string,
    zapNum :number,
    from : string,
    gas ?: number
}

export type UnbondArgs = {
	provider :string,
    endpoint : string,
    dots :number,
    from : string,
    gas ?: number
}

export type BondageArgs = {
	subscriber ?: string,
	provider: string,
	endpoint: string,
	dots ?: number ,
	zapNum ?: number
}
export type CalcBondRateType = {
    provider: string,
    endpoint: string,
    zapNum :number
}





export type listenEvent = {
    filter ?: any,
    callback: Function
}
