export type address = string;
export type txid = string;
import {BNType} from "@zapjs/types"
export const NULL_ADDRESS='0x0000000000000000000000000000000000000000';
export interface BondArgs {
    provider: address;
    endpoint: string;
    dots: string|number|BNType;
    subscriber: address;
    broker ?:address,
    gas ?: number;
}

export interface UnbondArgs {
	provider: address;
    endpoint: string;
    dots: number|string;
    subscriber: address;
    broker ?: address,
    gas ?: number;
}

export interface DelegateBondArgs {
    provider: address;
    endpoint: string;
    dots: number;
    subscriber: address;
    from: address;
    gas ?: number;
}

export interface BondageArgs {
	subscriber ?: address;
	provider: address;
	endpoint: string;
	dots ?: number|string ;
	zapNum ?: string|BNType;
}
export interface CalcBondRateType {
    provider: address;
    endpoint: string;
    zapNum: number;
}
