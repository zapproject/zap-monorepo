const assert = require("assert");
import {InitProvider, InitCurve, Respond, ProviderConstructorType} from "./types";
import {txid,Filter,NetworkProviderOptions,DEFAULT_GAS,BNType} from "@zapjs/types";
import {Curve,CurveType} from "@zapjs/curve"
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
    curves:any;
    title:string;
    pubkey:number|string;

    constructor(owner:string,options:NetworkProviderOptions) {
        assert(owner, 'owner address is required');
        this.providerOwner = owner;
        this.zapDispatch = new ZapDispatch(options)
        this.zapBondage = new ZapBondage(options);
        this.zapArbiter = new ZapArbiter(options);
        this.zapRegistry = new ZapRegistry(options);
        this.curves = {};
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
     * @param {number[]} term The curve array for this endpoint, setting the coefficients, powers, and domains for each piece.
     */
     async initiateProviderCurve({endpoint, term}: InitCurve) :Promise<txid>{
        if(endpoint in this.curves) throw("Endpoint " + endpoint + " already exists");
        let curve = new Curve(term)
        let txid = await this.zapRegistry.initiateProviderCurve({endpoint, term, from: this.providerOwner});
        assert(txid, 'Failed to init curve.');
        this.curves[endpoint] = curve;
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
     * Gets whether this provider has already been created
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve a true/false value.
     */
     async isProviderInitialized():Promise<boolean> {
        const created:boolean = await this.zapRegistry.isProviderInitiated(this.providerOwner);
        return created;
    }

    /**
     * Gets whether this endpoint and its corresponding curve have already been set
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve a true/false value.
     */
     async isEndpointCreated(endpoint:string):Promise<boolean> {
        const notCreated:boolean = await this.zapRegistry.isEndpointSet(this.providerOwner, endpoint);
        return !notCreated;
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
     async getCurve(endpoint:string):Promise<Curve> {
        if (endpoint in this.curves) return this.curves[endpoint];
        let curve = await this.zapRegistry.getProviderCurve(this.providerOwner, endpoint);
        this.curves[endpoint] = curve;
        return curve;
    }

    /**
     * Gets the total amount of Zap bound to a given endpoint.
     * @param {string} endpoint The endpoint identifier matching the desired endpoint
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into an amount of Zap (wei).
     */
     async getZapBound(endpoint:string):Promise<string|BNType> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getZapBound({
            provider: this.providerOwner, endpoint:endpoint});
    }

    /**
     * Gets the amount of dots bound by a user
     * @param {string} endpoint The endpoint identifier matching the desired endpoint
     * @param {string} subscriber The subscriber that is being checked
     * @returns {Promise<string|BigNumber>} Retunrs a Promise that will eventually resolve into an amount of dots
     */
    async getBoundDots({endpoint, subscriber}: {endpoint: string, subscriber: string}): Promise<string|BNType> {
    	assert(endpoint, 'endpoint required');
    	assert(subscriber, 'subscriber required');
    	return await this.zapBondage.getBoundDots({ endpoint, subscriber, provider: this.providerOwner });
    } 

    /**
     * Gets the total amount of DOTs issued
     * @param {string} endpoint The endpoint identifier matching the desired endpoint
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually be resolved into an integer amount of dots
     */
    async getDotsIssued(endpoint: string): Promise<string|BNType> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getDotsIssued({ provider: this.providerOwner, endpoint });
    }

    /**
     * Get maximum dots an endpoint can issue
     * @param endpoint
     */
    async getDotsLimit(endpoint:string):Promise<string|BNType>{
        return this.zapBondage.getDotsLimit({provider:this.providerOwner,endpoint:endpoint})
    }

    /**
     * Gets the total amount of Zap required to bond x dots.
     * @param endpoint The endpoint identifier matching the desired endpoint
     * @param dots Number of dots that is desired.
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into an amount of Zap (wei).
     */
     async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):Promise<string|BNType> {
        return await this.zapBondage.calcZapForDots({provider: this.providerOwner, endpoint, dots});
    }

    /**
     * Responds to a specific query from the subscriber by identifying a
     * @param {string} queryId The query identifier to send this response to
     * @param {string[] | number[]} responseParams List of responses returned by provider. Length determines which dispatch response is called
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
