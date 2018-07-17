import {Provider} from "web3/types";

const assert = require("assert");
import {Curve,CurveType} from "@zap/curve"
import {InitProvider, InitCurve, UnsubscribeListen, ListenQuery, Respond, ProviderConstructorType,ProviderHandler,address,txid} from "./types";
import {ZapDispatch} from "@zap/dispatch";
import {ZapRegistry} from "@zap/registry";
import {ZapBondage} from "@zap/bondage";
import {ZapArbiter} from "@zap/arbiter";
const {hexToUtf8} = require("web3-utils");
const EventEmitter = require('events');


export class ZapProvider  {
    providerOwner:string;
    handler : ProviderHandler;
    zapDispatch : ZapDispatch;
    zapBondage : ZapBondage;
    zapArbiter : ZapArbiter;
    zapRegistry:  ZapRegistry;
    curve : CurveType | undefined;
    title:string;
    pubkey:number|string

    constructor({owner,handler,zapRegistry,zapDispatch,zapBondage,zapArbiter}:ProviderConstructorType) {
        assert(owner, 'owner address is required');
        this.providerOwner = owner;
        this.handler = handler;
        this.zapDispatch = zapDispatch;
        this.zapBondage = zapBondage;
        this.zapArbiter = zapArbiter;
        this.zapRegistry = zapRegistry;
        this.curve = undefined;
        this.title = "";
        this.pubkey = '';

    }


    /**
     *Call ZapRegistry to create a new provider in Registry contract
     * @param {string} public_key
     * @param {string} title
     * @param {string} endpoint
     * @param {Array<string>} endpoint_params
     * @returns {Promise<txid>}
     */
    async initiateProvider({public_key, title, endpoint, endpoint_params}:InitProvider):Promise<txid> {
        assert(Array.isArray(endpoint_params), 'endpointParams need to be an array');
        return await this.zapRegistry.initiateProvider(
            {public_key, title, endpoint, endpoint_params, from:this.providerOwner});
    }

    /**
     * Initiate Curve for an endpoint
     * @param {string} endpoint
     * @param {number[]} constants
     * @param {number[]} parts
     * @param {number[]} dividers
     * @returns {Promise<txid>}
     */
    async initiateProviderCurve({endpoint, constants, parts, dividers}: InitCurve) :Promise<txid>{
        let curve = new Curve(constants, parts, dividers)
        // console.log("converted : ", convertedConstants);
        let txid = await this.zapRegistry.initiateProviderCurve({endpoint, curve, from: this.providerOwner});
        assert(txid, 'fail to init curve ');
        this.curve = new Curve(constants, parts, dividers);
        return txid;

    }

    /**
     * Get title of this provider from Registry contract
     * @returns {Promise<string>}
     */
    async getTitle():Promise<string> {
        let title:string;
        if (this.title) return this.title;
        title = await this.zapRegistry.getProviderTitle(this.providerOwner);
        this.title = title;
        return hexToUtf8(title);
        }


    /**
     * Get public key of this provider from Registry contract
     * @returns {Promise<string>}
     */
    async getPubkey():Promise<string|number> {
            if (this.pubkey) return this.pubkey;
            let pubkey = await this.zapRegistry.getProviderPublicKey(this.providerOwner);
            this.pubkey = pubkey;
            return hexToUtf8(pubkey);
    }


    /**
     * Get Curve of an owned endpoint
     * @param {string} endpoint
     * @returns {Promise<CurveType>}
     */
    async getCurve(endpoint:string):Promise<CurveType> {
        if (this.curve) return this.curve;
        let curve = await this.zapRegistry.getProviderCurve(this.providerOwner, endpoint);
        this.curve = curve;
        return curve;
    }


    /**
     * Get amount Zap bound to an owned endpoint
     * @param {string} endpoint
     * @returns {Promise<number>} number of Zap Token bound
     */
    async getZapBound(endpoint:string):Promise<number> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getZapBound({
            provider: this.providerOwner, endpoint:endpoint});
    }

    /**
     *
     * @param endpoint
     * @param dots
     * @returns {Promise<number>}
     */
    async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):Promise<number> {
        return await this.zapBondage.calcZapForDots({provider: this.providerOwner, endpoint, dots});
    }


    /**
     * Calculate number of dots that subscriber can use for inquired number of Zap Tokens
     * @param {string} endpoint
     * @param {number} zapNum
     * @returns {Promise<number>} number of dots subscriber can get
     */
    async calcDotsForZap({endpoint, zapNum}:{endpoint:string, zapNum:number}): Promise<number> {
        let res = await this.zapBondage.calcBondRate({
            provider: this.providerOwner,
            endpoint,
            zapNum});
        return res;
    }


    /**
     * listen to new subscription events to this provider, managed by Arbiter contract
     * @param {string} subscriber
     * @param {number} fromBlock
     * @returns {Promise<void>}
     */
    async listenSubscribes({subscriber, fromBlock}:{subscriber:string, fromBlock: number}):Promise<void> {
        let callback = (error:any, result:string) => {
            if (error) {
                console.error(error);
            } else {
                return this.handler.handleSubscription(result);
            }
        };

        this.zapArbiter.listenSubscriptionStart(
            {provider: this.providerOwner, subscriber},
            callback);
    }

    /**
     *Listen to unsubscription events to this provider, managed by Arbiter contract
     * @param {string} subscriber
     * @param {string} terminator : address that call unsubscribe, this can be subscriber or provider
     * @param {number} fromBlock
     * @returns {Promise<void>}
     */
    async listenUnsubscribes({subscriber, terminator, fromBlock}:UnsubscribeListen) :Promise<void>{
        let callback = (error:Error, result:string) => {
            if (error) {
                console.log(error);
            } else {
                return this.handler.handleUnsubscription(result);
            }
        };

        this.zapArbiter.listenSubscriptionEnd(
            {provider: this.providerOwner, subscriber, terminator, fromBlock},
            callback);
    }

    /**
     * Listen to Queries events, managed by Dispatch contract
     * @param {string} queryId
     * @param {address} subscriber
     * @param {number} fromBlock
     * @returns {Promise<void>}
     */
    async listenQueries({queryId, subscriber, fromBlock}:ListenQuery) :Promise<void> {
        let callback = (error:any, result:string) => {
            if (error) {
                console.error(error);
            } else {
                return this.handler.handleIncoming(result);
            }
        };

        this.zapDispatch.listenIncoming({queryId, provider: this.providerOwner, subscriber, fromBlock},
            callback);
    }

    /**
     * Respond to a query
     * @param {string} queryId
     * @param {string[]} responseParams
     * @param {boolean} dynamic number of responses or not
     * @returns {Promise<any>}
     */
    async respond({queryId, responseParams, dynamic}:Respond):Promise<string>{
        return await this.zapDispatch.respond({queryId, responseParams, dynamic, from: this.providerOwner});
    }

}
