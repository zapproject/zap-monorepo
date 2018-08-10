import {ZapDispatch} from "@zapjs/dispatch1";
import{ZapToken} from '@zapjs/zaptoken1';
import {ZapBondage} from "@zapjs/bondage1";
import{ZapArbiter} from '@zapjs/arbiter1';
import {ZapRegistry} from "@zapjs/registry1";

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
