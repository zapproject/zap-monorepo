import {ZapDispatch} from "@zapjs/dispatch";
import {ZapRegistry} from "@zapjs/registry";
import {ZapBondage} from "@zapjs/bondage";
import {ZapArbiter} from "@zapjs/arbiter";
import {address,txid, BNType, defaultTx} from "@zapjs/types";
import extend = hbs.Utils.extend;

export interface InitProvider extends defaultTx  {
    public_key : string,
    title :string
}

export interface InitCurve extends defaultTx{
    endpoint:string,
    term: number[],
    broker?: address
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

export interface Respond extends defaultTx{
    queryId:string,
    responseParams : Array<string | number>,
    dynamic:boolean
}

export type ProviderConstructorType = {
    owner:address,
    zapDispatch?:ZapDispatch,
    zapBondage?: ZapBondage,
    zapArbiter?: ZapArbiter,
    zapRegistry?: ZapRegistry
}

export interface SetProviderParams extends defaultTx{
    key: string,
    value: string
}

export interface SetProviderTitle extends defaultTx{
    title:string
}

export interface ClearEndpoint extends defaultTx{
    endpoint:string
}
