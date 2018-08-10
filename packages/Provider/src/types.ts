import {ZapDispatch} from "@zapjs/dispatch1";
import {ZapRegistry} from "@zapjs/registry1";
import {ZapBondage} from "@zapjs/bondage1";
import {ZapArbiter} from "@zapjs/arbiter1";
import {address,txid} from "@zapjs/types";

export type InitProvider = {
    public_key : string,
    title :string,
    endpoint: string,
    endpoint_params ?: Array<string>,
    gas ?: number
}

export type InitCurve = {
    endpoint:string,
    term: number[],
    from:string
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
    zapDispatch?:ZapDispatch,
    zapBondage?: ZapBondage,
    zapArbiter?: ZapArbiter,
    zapRegistry?: ZapRegistry,
}
