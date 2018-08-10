import {ZapDispatch} from "@zapjs/dispatch";
import{ZapToken} from '@zapjs/zaptoken';
import {ZapBondage} from "@zapjs/bondage";
import{ZapArbiter} from '@zapjs/arbiter';
import {ZapRegistry} from "@zapjs/registry";

export type BondType = {
    provider:string,
    endpoint:string,
    dots :number
}
export type UnbondType = {
    provider:string,
    endpoint:string,
    dots :number
}

export type SubscribeType = {
    provider:string,
    endpoint:string,
    dots :number,
    endpointParams : string[]
}
export type SubscriberConstructorType = {
  owner:string,
  handler ?: any
}

export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}
