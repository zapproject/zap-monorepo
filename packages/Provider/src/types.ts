import {CurveType} from "@zap/curve"
import {ZapDispatch} from "@zap/dispatch";
import {ZapRegistry} from "@zap/registry";
import {ZapBondage} from "@zap/bondage";
import {ZapArbiter} from "@zap/arbiter";
export type address = string;
export type txid = string|object;
export type InitProvider = {
    public_key : string,
    title :string,
    endpoint: string,
    endpoint_params ?: Array<string>,
    gas ?: number
}

export type InitCurve = {
    endpoint:string,
    constants :number[],
    parts: number[],
    dividers: number[],
    gas ?: number
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
    responseParams : string[],
    dynamic:boolean
}

export type ProviderConstructorType = {
    owner:address,
    zapDispatch:ZapDispatch,
    zapBondage: ZapBondage,
    zapArbiter: ZapArbiter,
    zapRegistry: ZapRegistry,
    handler : ProviderHandler
}

export interface ProviderHandler{
    handleIncoming : Function,
    handleUnsubscription : Function,
    handleSubscription : Function
}
