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

/**
 * @class
 * Represents an offchain Provider and provides an interface to the appropriate smart contracts.
 */
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
     * Calls the Registry contract to initialize a new provider endpoint. This needs to be called for each endpoint. 
     * @param {string} public_key A public identifier for this oracle
     * @param {string} title A descriptor describing what data this oracle provides
     * @param {string} endpoint The endpoint identifier
     * @param {Array<string>} endpoint_params The parameters that this endpoint accepts as query arguments
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async initiateProvider({public_key, title, endpoint, endpoint_params}:InitProvider):Promise<txid> {
        assert(Array.isArray(endpoint_params), 'endpointParams need to be an array');
        return await this.zapRegistry.initiateProvider(
            {public_key, title, endpoint, endpoint_params, from:this.providerOwner});
    }

    /**
     * Calls the Registry contract to initialize a new Curve for a given endpoint. See Curve for more information on encoding.
     * @param {string} endpoint The endpoint identifier matching the created endpoint
     * @param {number[]} constants The constants array for this curve, setting the coefficients, powers, and functions for each term.
     * @param {number[]} parts The parts array that defines the ranges that each piece applies to.
     * @param {number[]} dividers The dividers array that demarcates each piecewise piece
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async initiateProviderCurve({endpoint, constants, parts, dividers}: InitCurve) :Promise<txid>{
        let curve = new Curve(constants, parts, dividers)
        let txid = await this.zapRegistry.initiateProviderCurve({endpoint, curve, from: this.providerOwner});
        assert(txid, 'Failed to init curve.');
        this.curve = new Curve(constants, parts, dividers);
        return txid;
    }

    /**
     * Gets the title of this provider from the Registry contract.
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into the title of this provider.
     */
     async getTitle():Promise<string> {
        let title:string;
        if (this.title) return this.title;
        title = await this.zapRegistry.getProviderTitle(this.providerOwner);
        this.title = title;
        return title;
    }

    /**
     * Gets the public key of this provider from the Registry contract.
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into the public key of this provider.
     */
     async getPubkey():Promise<string|number> {
        if (this.pubkey) return this.pubkey;
        let pubkey = await this.zapRegistry.getProviderPublicKey(this.providerOwner);
        this.pubkey = pubkey;
        return pubkey;
    }

    /**
     * Gets the Curve of a defined endpoint from the Registry contract.
     * @param {string} endpoint The endpoint identifier matching the desired endpoint
     * @returns {Promise<CurveType>} Returns a Promise that will eventually resolve into the Curve of this provider's endpoint.
     */
     async getCurve(endpoint:string):Promise<CurveType> {
        if (this.curve) return this.curve;
        let curve = await this.zapRegistry.getProviderCurve(this.providerOwner, endpoint);
        this.curve = curve;
        return curve;
    }

    /**
     * Gets the total amount of Zap bound to a given endpoint.
     * @param {string} endpoint The endpoint identifier matching the desired endpoint
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer amount of Zap (wei). 
     */
     async getZapBound(endpoint:string):Promise<number> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getZapBound({
            provider: this.providerOwner, endpoint:endpoint});
    }

    /**
     * Gets the total amount of Zap required to bond x dots.
     * @param endpoint The endpoint identifier matching the desired endpoint
     * @param dots Number of dots that is desired.
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer amount of Zap (wei). 
     */
     async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):Promise<number> {
        return await this.zapBondage.calcZapForDots({provider: this.providerOwner, endpoint, dots});
    }

    /**
     * Calculate the total number of dots that the subscriber can receive for a given amount of Zap.
     * @param {string} endpoint The endpoint identifier matching the desired endpoint 
     * @param {number} zapNum Amount of Zap (wei) to calculate dots for
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer number of dots.
     */
     async calcDotsForZap({endpoint, zapNum}:{endpoint:string, zapNum:number}): Promise<number> {
        return await this.zapBondage.calcBondRate({
            provider: this.providerOwner,
            endpoint,
            zapNum});
    }

    /**
     * Responds to a specific query from the subscriber by identifying a 
     * @param {string} queryId The query identifier to send this response to
     * @param {string[]} responseParams List of responses returned by provider. Length determines which dispatch response is called
     * @param {boolean} dynamic True if the response contains a dynamic bytes32 array
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async respond({queryId, responseParams, dynamic}:Respond):Promise<string>{
        return await this.zapDispatch.respond({queryId, responseParams, dynamic, from: this.providerOwner});
    }

    /**
     * Listen for start subscription events from the Arbiter contract.
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

        return this.zapArbiter.listenSubscriptionStart(
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

        return this.zapArbiter.listenSubscriptionEnd(
            {provider: this.providerOwner, subscriber, terminator, fromBlock},
            callback);
    }

    /**
     * Listen to Queries events, managed by Dispatch contract
     * @param {string} queryId The query ID 
     * @param {address} subscriber
     * @param {number} fromBlock
     * @returns {Promise<void>}
     */
     async listenQueries({fromBlock}:ListenQuery) :Promise<void> {
        let callback = (error:any, result:string) => {
            if (error) {
                console.error(error);
            } else {
                return this.handler.handleIncoming(result);
            }
        };

        return this.zapDispatch.listenIncoming(
            {provider: this.providerOwner, fromBlock},
            callback);
    }

}
