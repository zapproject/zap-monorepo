import {ZapDispatch} from "@zap/dispatch";
import{ZapToken} from '@zap/zaptoken';
import {ZapBondage} from "@zap/bondage";
import{ZapArbiter} from '@zap/arbiter';
import {ZapRegistry} from "@zap/registry";

export type BondType = {
    provider:string,
    endpoint:string,
    zapNum :number
}
export type UnbondType = {
    provider:string,
    endpoint:string,
    dots :number
}

export type SubscribeType= {
    provider:string,
    endpoint:string,
    dots :number,
    endpointParams : string[]
}
export type SubscriberConstructorType = {
  owner:string,
  zapDispatch:ZapDispatch,
  zapToken:ZapToken,
  zapBondage: ZapBondage,
  zapArbiter: ZapArbiter,
  zapRegistry: ZapRegistry,
  handler ?: any
}

export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}
