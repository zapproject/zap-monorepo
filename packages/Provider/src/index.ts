const assert = require("assert");
import {Curve,CurveType} from "@zapjs/curve"
import {InitProvider, InitCurve, Respond, ProviderConstructorType,txid,Filter} from "./types";
import {ZapDispatch} from "@zapjs/dispatch";
import {ZapRegistry} from "@zapjs/registry";
import {ZapBondage} from "@zapjs/bondage";
import {ZapArbiter} from "@zapjs/arbiter";

/**
 * @class
 * Represents an Zap Providers and provides an interface to the appropriate smart contracts.
 */
 export class ZapProvider  {
    providerOwner:string;
    zapDispatch : ZapDispatch;
    zapBondage : ZapBondage;
    zapArbiter : ZapArbiter;
    zapRegistry:  ZapRegistry;
    curve : CurveType | undefined;
    title:string;
    pubkey:number|string;

    constructor({owner,zapRegistry,zapDispatch,zapBondage,zapArbiter}:ProviderConstructorType) {
        assert(owner, 'owner address is required');
        this.providerOwner = owner;
        this.zapDispatch = zapDispatch || new ZapDispatch();
        this.zapBondage = zapBondage || new ZapBondage();
        this.zapArbiter = zapArbiter || new ZapArbiter();
        this.zapRegistry = zapRegistry || new ZapRegistry();
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
     * @param {Utils.Types.Filter}
     * @param {Function} callback
     */
    listenSubscribes(filters:Filter,callback:Function):void {
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapArbiter.listenSubscriptionStart(thisFilters,callback);
    }


    /**
     *Listen to unsubscription events emitted by the Arbiter contract.
     * @param {Utils.Types.Filter} filters
     * @param {Function} callback
     */
    listenUnsubscribes(filters:Filter,callback:Function) :void{
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapArbiter.listenSubscriptionEnd(thisFilters,callback);
    }


    /**
     * Listen to Query events emitted by the Dispatch contract.
     * @param {Utils.Types.Filter} filters
     * @param {Function} callback
     */
    listenQueries(filters:Filter,callback:Function) :void {
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapDispatch.listenIncoming(thisFilters,callback);
    }

}
