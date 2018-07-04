import * as assert from "assert"
import {Curve,CurveTypes} from "@zap/curve"
import {ZapDispatch,DispatchTypes} from "@zap/dispatch";
import {ZapRegistry,RegistryTypes} from "@zap/registry";
import {ZapBondage, BondageTypes} from "@zap/bondage";
import {ZapArbiter} from "@zap/arbiter"
import {InitProvider, InitCurve, UnsubscribeListen, ListenQuery,Respond} from "./types"
const Web3 = require('web3');
const web3 = new Web3();

class Provider {

    constructor({owner :{owner:string}, handler:SubscriptionHandler}) {
        this.owner = owner;
        this.handler = handler;
        this.pubkey = this.title = this.curve = null;
    }

    get owner(): string{
        return this.owner;
    }

    get handler(): object {
        return this.handler;
    }

    set handler(handler:object) :void {
        this.handler = handler;
    }

    /**
     *
     * @param pubkey
     * @param title
     * @param endpoint
     * @param params
     * @returns {Promise<any>}
     */
    async initiate({public_key, title, endpoint, endpoint_params}:InitProvider) {
        try {
            assert(Array.isArray(endpoint_params), 'params need to be an array');
            let provider = await ZapRegistry.initiateProvider(
                {public_key, title, endpoint, endpoint_params, from:this.owner});
            assert(provider, 'fail to create provider');
            this.pubkey = public_key;
            this.title = title;
            return provider;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     *
     * @param endpoint
     * @param constants
     * @param parts
     * @param dividers
     * @returns {Promise<*>}
     */
    async initCurve({endpoint, constants, parts, dividers}: InitCurve) :boolean {
        try {
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
            let success = await ZapRegistry.initiateProviderCurve({endpoint, curve, from: this.owner});

            assert(success, 'fail to init curve ');
            this.curve = new Curve(constants, parts, dividers);
            return success;
        } catch (err) {
            console.error(err);
            return null;
        }
    }


    /**
     *
     * @returns {Promise<string>}
     */
    async getProviderTitle():string {
        try {
            if (this.title) return this.title;
            let title = await ZapRegistry.getProviderTitle(this.owner);
            this.title = title;
            return web3.utils.hexToUtf8(title);
        } catch (e){
            console.error(e);
            return null;
        }

    }

    /**
     *
     * @returns {Promise<string>}
     */
    async getProviderPubkey():string {
        try {
            if (this.pubkey) return this.pubkey;
            let pubkey = await ZapRegistry.getProviderPubkey(this.owner);
            this.pubkey = pubkey;
            return web3.utils.hexToUtf8(pubkey);
        } catch (e){
            console.error('Provider is not initiated');
            return null;
        }
    }


    async getProviderCurve({endpoint}: {endpoint:string}):CurveTypes.Curve {
        if (this.curve) return this.curve;
        try {
            let curve = await ZapRegistry.getProviderCurve(this.owner, endpoint);
            this.curve = curve;
            return curve;
        } catch (err) {
            console.error(err);
            return null;
        }
    }


    async getZapBound({endpoint} : {endpoint:string}):number {
        assert(endpoint, 'endpoint required');
        let zapBound = await Bondage.getZapBound(this.owner, endpoint);
        return zapBound;
    }

    /**
     *
     * @param endpoint
     * @param dots
     * @returns {Promise<number>}
     */
    async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):number {
        let zapRequired = await ZapBondage.calcZapForDots({provider: this.owner, endpoint, dots});
        return parseInt(zapRequired);
    }

    /**
     *
     * @param endpoint
     * @param zapNum
     * @returns {Promise<any>}
     */
    async calcDotsForZap({endpoint, zapNum}:{endpoint:string, zapNum:number}): number {
        let res = await ZapBondage.calcBondRate({
            provider: this.owner,
            endpoint,
            zapNum});
        return res;
    }


    /**
     *
     * @param subscriber
     * @param fromBlock
     * @returns {Promise<*>}
     */
    async listenSubscribes({subscriber, fromBlock}:{subscriber:string, fromBlock: number}):void {
        let callback = (error, result) => {
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

        ZapArbiter.listenSubscriptionStart(
            {provider: this.owner, subscriber},
            callback);
    }

    /**
     *
     * @param subscriber
     * @param terminator
     * @param fromBlock
     * @returns {Promise<void>}
     */
    async listenUnsubscribes({subscriber, terminator, fromBlock}:UnsubscribeListen) {
        let callback = (error, result) => {
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

        ZapArbiter.listenSubscriptionEnd(
            {provider: this.owner, subscriber, terminator, fromBlock},
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
    async listenQueries({queryId, subscriber, fromBlock}:ListenQuery) {
        let callback = (error, result) => {
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

        ZapDispatch.listen('Incoming',
            {queryId, provider: this.owner, subscriber, fromBlock},
            callback);
    }

    /**
     *
     * @param queryId
     * @param responseParams
     * @param dynamic
     * @returns {Promise<void>}
     */
    async respond({queryId, responseParams, dynamic}:Respond){
        try {
            let res = await Dispatch.respond({queryId, responseParams, dynamic, from: this.owner});
            return res;
        } catch (e){
            console.error(e);
            return null;
        }
    }

}

module.exports = Provider;
