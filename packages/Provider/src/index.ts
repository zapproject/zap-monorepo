const assert = require("assert");
import {Curve,CurveType} from "@zap/curve"
import {InitProvider, InitCurve, UnsubscribeListen, ListenQuery, Respond, ProviderConstructorType,ProviderHandler} from "./types";
const {hexToUtf8} = require("web3-utils");
const EventEmitter = require('events');


export class Provider extends EventEmitter {
    constructor({owner,handler,zapRegistry,zapDispatch,zapBondage,zapArbiter}:ProviderConstructorType) {
        super();
        assert(owner, 'owner address is required');
        this.providerOwner = owner;
        this.handler = handler;
        this.zapDispatch = zapDispatch;
        this.zapBondage = zapBondage;
        this.zapArbiter = zapArbiter;
        this.zapRegistry = zapRegistry;
    }


    /**
     *
     * @param {string} public_key
     * @param {string} title
     * @param {string} endpoint
     * @param {Array<string>} endpoint_params
     * @returns {Promise<any>}
     */
    async initiate({public_key, title, endpoint, endpoint_params}:InitProvider) {
        assert(Array.isArray(endpoint_params), 'params need to be an array');
        let provider = await this.zapRegistry.initiateProvider(
            {public_key, title, endpoint, endpoint_params, from:this.providerOwner});
        assert(provider, 'fail to create provider');
        this.pubkey = public_key;
        this.title = title;
        return provider;
    }

    /**
     *
     * @param {string} endpoint
     * @param {number[]} constants
     * @param {number[]} parts
     * @param {number[]} dividers
     * @returns {boolean}
     */
    async initCurve({endpoint, constants, parts, dividers}: InitCurve) :Promise<boolean>{
        assert((constants instanceof Array
            && parts instanceof Array
            && dividers instanceof Array),
            "curve's arguments need to be array");
        assert(endpoint && constants.length > 0
            && parts.length > 0
            && dividers.length > 0,
            'cant init empty curve args');
        let curve = {constants, parts, dividers};
        // console.log("converted : ", convertedConstants);
        let success = await this.zapRegistry.initiateProviderCurve({endpoint, curve, from: this.providerOwner});

        assert(success, 'fail to init curve ');
        this.curve = new Curve(constants, parts, dividers);
        return success;

    }


    /**
     *
     * @returns {Promise<string>}
     */
    async getProviderTitle():Promise<string> {
        if (this.title) return this.title;
        let title = await this.zapRegistry.getProviderTitle(this.providerOwner);
        this.title = title;
        return hexToUtf8(title);
        }


    async getProviderPubkey():Promise<string> {
            if (this.pubkey) return this.pubkey;
            let pubkey = await this.zapRegistry.getProviderPubkey(this.providerOwner);
            this.pubkey = pubkey;
            return hexToUtf8(pubkey);

    }


    async getProviderCurve({endpoint}: {endpoint:string}):Promise<CurveType> {
        if (this.curve) return this.curve;
        let curve = await this.zapRegistry.getProviderCurve(this.providerOwner, endpoint);
        this.curve = curve;
        return curve;
    }


    /**
     *
     * @param {string} endpoint
     * @returns {number}
     */
    async getZapBound({endpoint} : {endpoint:string}):Promise<number> {
        assert(endpoint, 'endpoint required');
        let zapBound = await this.zapBondage.getZapBound(this.providerOwner, endpoint);
        return zapBound;
    }

    /**
     *
     * @param endpoint
     * @param dots
     * @returns {Promise<number>}
     */
    async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):Promise<number> {
        let zapRequired = await this.zapBondage.calcZapForDots({provider: this.providerOwner, endpoint, dots});
        return parseInt(zapRequired);
    }

    /**
     *
     * @param {string} endpoint
     * @param {number} zapNum
     * @returns {number}
     */
    async calcDotsForZap({endpoint, zapNum}:{endpoint:string, zapNum:number}): Promise<number> {
        let res = await this.zapBondage.calcBondRate({
            provider: this.providerOwner,
            endpoint,
            zapNum});
        return res;
    }


    /**
     *
     * @param {string} subscriber
     * @param {number} fromBlock
     */
    async listenSubscribes({subscriber, fromBlock}:{subscriber:string, fromBlock: number}):Promise<void> {
        let callback = (error:any, result:string) => {
            if (error) {
                console.log(error);
            } else {
                try {
                    return this.handler.handleSubscription(result);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        this.zapArbiter.listenSubscriptionStart(
            {provider: this.providerOwner, subscriber},
            callback);
    }

    /**
     *
     * @param {string} subscriber
     * @param {string} terminator
     * @param {number} fromBlock
     * @returns {Promise<void>}
     */
    async listenUnsubscribes({subscriber, terminator, fromBlock}:UnsubscribeListen) {
        let callback = (error:Error, result:string) => {
            if (error) {
                console.log(error);
            } else {
                try {
                    return this.handler.handleUnsubscription(result);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        this.zapArbiter.listenSubscriptionEnd(
            {provider: this.providerOwner, subscriber, terminator, fromBlock},
            callback);
    }

    /**
     *Listen to Queries
     * @param id
     * @param subscriber
     * @param fromBlock
     * @param from
     * @returns {Promise<void>}
     */
    async listenQueries({queryId, subscriber, fromBlock}:ListenQuery) :Promise<void> {
        let callback = (error:any, result:string) => {
            if (error) {
                console.error(error);
            } else {
                try {
                    return this.handler.handleIncoming(result);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        this.zapDispatch.listen('Incoming',
            {queryId, provider: this.providerOwner, subscriber, fromBlock},
            callback);
    }

    /**
     *
     * @param {string} queryId
     * @param {string[]} responseParams
     * @param {boolean} dynamic
     * @returns {Promise<any>}
     */
    async respond({queryId, responseParams, dynamic}:Respond){
        try {
            let res = await this.zapDispatch.respond({queryId, responseParams, dynamic, from: this.providerOwner});
            return res;
        } catch (e){
            console.error(e);
            return null;
        }
    }

}
