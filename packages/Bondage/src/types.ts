export type address = string;
export type txid = string;
import {BNType,defaultTx,Filter} from "@zapjs/types"

export interface BondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: string|number|BNType;
}

export interface UnbondArgs extends defaultTx{
	provider: address;
    endpoint: string;
    dots: number|string;
}

export interface DelegateBondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: number;
    subscriber: address;
}

export interface BondageArgs {
	subscriber ?: address;
	provider: address;
	endpoint: string;
	dots ?: number|string ;
	zapNum ?: string|number;
}
export interface CalcBondRateType {
    provider: address;
    endpoint: string;
    zapNum: number;
}

export interface BondFilter extends Filter{
    numDots ?: number|string|BNType,
    numZap ?: number|string|BNType
}
