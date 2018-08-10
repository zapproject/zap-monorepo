export type address = string;
export type txid = string;
export interface BondArgs {
    provider: address;
    endpoint: string;
    dots: number;
    from: address;
    gas ?: number;
}

export interface UnbondArgs {
	provider: address;
    endpoint: string;
    dots: number;
    from: address;
    gas ?: number;
}

export interface BondageArgs {
	subscriber ?: address;
	provider: address;
	endpoint: string;
	dots ?: number ;
	zapNum ?: number;
}
export interface CalcBondRateType {
    provider: address;
    endpoint: string;
    zapNum: number;
}
