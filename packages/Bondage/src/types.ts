export type address = string;
export type txid = string;
import {BNType,defaultTx,Filter,NumType} from "@zapjs/types"

export interface BondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: NumType;
}

export interface UnbondArgs extends defaultTx{
	provider: address;
    endpoint: string;
    dots: NumType;
}

export interface DelegateBondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: NumType,
    subscriber: address;
}

export interface BondageArgs {
	subscriber ?: address;
	provider: address;
	endpoint: string;
	dots ?: NumType ;
	zapNum ?: NumType;
}
export interface CalcBondRateType {
    provider: address;
    endpoint: string;
    zapNum: NumType;
}

export interface BondFilter extends Filter{
    numDots ?: NumType,
    numZap ?: NumType
}
