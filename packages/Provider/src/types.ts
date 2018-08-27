import {ZapDispatch} from "@zapjs/dispatch";
import {ZapRegistry} from "@zapjs/registry";
import {ZapBondage} from "@zapjs/bondage";
import {ZapArbiter} from "@zapjs/arbiter";
import {address,txid, BNType} from "@zapjs/types";

export type InitProvider = {
    public_key : string,
    title :string,
    gas ?: BNType
}

export type InitCurve = {
    endpoint:string,
    term: number[],
    broker: address,
}

export type UnsubscribeListen = {
    subscriber:address,
    terminator : address,
    fromBlock : number
}

export type ListenQuery = {
    queryId: string,
    subscriber :address,
    fromBlock : number
}

export type Respond = {
    queryId:string,
    responseParams : Array<string | number>,
    dynamic:boolean
}

export type ProviderConstructorType = {
    owner:address,
    zapDispatch?:ZapDispatch,
    zapBondage?: ZapBondage,
    zapArbiter?: ZapArbiter,
    zapRegistry?: ZapRegistry,
}

export type SetProviderParams = {
    key: string,
    value: string,
}
