import {address} from "@zapjs/types";

const assert = require("assert");
import {InitProvider, InitCurve, Respond, SetProviderParams} from "./types";
import {txid,Filter,NetworkProviderOptions,DEFAULT_GAS,BNType,
    DataPurchaseEvent,
    SubscriptionEndEvent} from "@zapjs/types";
import {Curve,CurveType} from "@zapjs/curve"
import {ZapDispatch} from "@zapjs/dispatch";
import {EndpointParams, ZapRegistry} from "@zapjs/registry";
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
    curves:{[key:string]:Curve};
    title:string;
    pubkey:number|string;

    /**
     * @constructor
     * @param {string} owner Provider owner's address
     * @param {NetworkProviderOptions} options network provider options
     * @example new ZapProvider(owner,{networkId:42,networkProvider:web3})
     *
     */
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
     * @param {InitProvider} i. {public_key, title, gas=DEFAULT_GAS}
     * @param {string} i.public_key A public identifier for this oracle
     * @param {string} i.title A descriptor describing what data this oracle provides
     * @returns {Promise<txid>}txid
     */
     async initiateProvider({public_key, title, gas=DEFAULT_GAS}:InitProvider):Promise<txid> {
        return await this.zapRegistry.initiateProvider(
            {public_key, title, from: this.providerOwner, gas});
    }

    /**
     * Calls the Registry contract to initialize a new Curve for a given endpoint. See Curve for more information on encoding.
     * @param {InitCurve} i. {endpoint, term, broker,gas=DEFAULT_GAS}
     * @param {string} i.endpoint - The endpoint identifier matching the created endpoint
     * @param {address} i.broker - Address of broker allowed to bond/unbond. 0 means anyone can
     * @param {number[]} i.term - The curve array for this endpoint, setting the coefficients, powers, and domains for each piece.
     * @returns {Promise<txid>} txid
     */
     async initiateProviderCurve({endpoint, term, broker,gas=DEFAULT_GAS}: InitCurve) :Promise<txid>{
        if(endpoint in this.curves) throw("Endpoint " + endpoint + " already exists");
        let curve = new Curve(term)
        let txid = await this.zapRegistry.initiateProviderCurve({endpoint, term, broker, from: this.providerOwner,gas});
        assert(txid, 'Failed to init curve.');
        this.curves[endpoint] = curve;
        return txid;
    }

    /**
     * Set the parameter of a provider
     * @param {SetProviderParams} s. { key, value}
     * @param {string} s.key - The key to be set
     * @param {string} s.value - The value to set the key to
     * @returns {Promise<txid>} txid
     */
    async setProviderParameter({ key, value, gas=DEFAULT_GAS}: SetProviderParams): Promise<txid> {
        return await this.zapRegistry.setProviderParameter({
            key,
            value,
            from: this.providerOwner,
            gas
        });
    }

    /**
     * Set params for an endpoint
     * @param endpoint
     * @param endpoint_params
     * @param gas
     * @returns {Promise<txid>}
     */
    async setEndpointParams({endpoint,endpoint_params=[],gas=DEFAULT_GAS}:EndpointParams):Promise<txid>{
        return await this.zapRegistry.setEndpointParams({
            endpoint,
            endpoint_params,
            from:this.providerOwner,
            gas
        })
    }

    /******************GETTERS**************************/

    /**
     * Gets the title of this provider from the Registry contract.
     * @returns {Promise<string>} Promise of the title of this provider.
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
     * @returns {Promise<boolean>}
     */
     async isProviderInitialized():Promise<boolean> {
        const created:boolean = await this.zapRegistry.isProviderInitiated(this.providerOwner);
        return created;
    }

    /**
     * Gets whether this endpoint and its corresponding curve have already been set
     * @param {string} endpoint - Endpoint identifier to check if it's created
     * @returns {Promise<boolean>}
     */
     async isEndpointCreated(endpoint:string):Promise<boolean> {
        const created:boolean = await this.zapRegistry.isEndpointSet(this.providerOwner, endpoint);
        return created;
    }

    /**
     * Gets the public key of this provider from the Registry contract.
     * @returns {Promise<string|number>} Public key of this provider.
     */
     async getPubkey():Promise<string|number> {
        if (this.pubkey) return this.pubkey;
        let pubkey = await this.zapRegistry.getProviderPublicKey(this.providerOwner);
        this.pubkey = pubkey;
        return pubkey;
    }

    /**
     * Gets the Curve of a defined endpoint from the Registry contract.
     * @param {string} endpoint - The endpoint identifier
     * @returns {Promise<CurveType>} Promise of the Curve of this provider's endpoint.
     */
     async getCurve(endpoint:string):Promise<Curve> {
        if (endpoint in this.curves) return this.curves[endpoint];
        let curve = await this.zapRegistry.getProviderCurve(this.providerOwner, endpoint);
        this.curves[endpoint] = curve;
        return curve;
    }

    /**
     * Gets the total amount of Zap bound to a given endpoint.
     * @param {string} endpoint The endpoint identifier
     * @returns {Promise<string|BigNumber>} Promise of amount of bound Zap (wei).
     */
     async getZapBound(endpoint:string):Promise<string|BNType> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getZapBound({
            provider: this.providerOwner, endpoint:endpoint});
    }

    /**
     * Gets the amount of dots bound by a user
     * @param {Object} e. {endpoint, subscriber}
     * @param {string} e.endpoint - The endpoint identifier
     * @param {string} e.subscriber - The subscriber that is being checked
     * @returns {Promise<string|BigNumber>} Promise of an amount of dots
     */
    async getBoundDots({endpoint, subscriber}: {endpoint: string, subscriber: string}): Promise<string|BNType> {
    	assert(endpoint, 'endpoint required');
    	assert(subscriber, 'subscriber required');
    	return await this.zapBondage.getBoundDots({ endpoint, subscriber, provider: this.providerOwner });
    } 

    /**
     * Gets the total amount of DOTs issued
     * @param {string} endpoint - The endpoint identifier
     * @returns {Promise<string|BigNumber>} Amount of dots
     */
    async getDotsIssued(endpoint: string): Promise<string|BNType> {
        assert(endpoint, 'endpoint required');
        return await this.zapBondage.getDotsIssued({ provider: this.providerOwner, endpoint });
    }

    /**
     * Get maximum dots an endpoint can issue
     * @param {string} endpoint -Endpoint identifier
     * @returns {Promise<string|Bignumber>} Maximum dots can be bound to this endpoint
     */
    async getDotsLimit(endpoint:string):Promise<string|BNType>{
        return this.zapBondage.getDotsLimit({provider:this.providerOwner,endpoint:endpoint})
    }

    /**
     * Gets the total amount of Zap required to bond x dots.
     * @param {Object} e. {endpoint, dots}
     * @param {string} e.endpoint - The endpoint identifier
     * @param {number} e.dots - Number of dots
     * @returns {Promise<string|BigNumber>} Amount of required Zap (wei)
     */
     async getZapRequired({endpoint, dots}:{endpoint:string,dots:number}):Promise<string|BNType> {
        return await this.zapBondage.calcZapForDots({provider: this.providerOwner, endpoint, dots});
    }

    /**
     * Get a parameter from a provider
     * @param {string} key The key for param
     * @returns {Promise<string>} Value of the key param
     */
    async getProviderParam(key: string): Promise<string> {
        return await this.zapRegistry.getProviderParam(this.providerOwner, key);
    }

    /**
     * Get all the parameters of a provider
     * @returns {Promise<string[]>} List of Params belong to this provider
     */
    async getAllProviderParams(): Promise<string[]> {
        return await this.zapRegistry.getAllProviderParams(this.providerOwner);
    }

    /**
     * Get broker address of this endpoint
     * @param {string} endpoint- Endpoint identifier
     * @returns {Promise<address>} Broker address or null address if there is no broker for this endpoint
     */
    async getEndpointBroker(endpoint:string):Promise<address>{
        return await this.zapRegistry.getEndpointBroker(this.providerOwner,endpoint);
    }

    /**
     * Get the endpoint params at a certain index of a provider's endpoint.
     * @param {string} endpoint - Endpoint identifier
     * @returns {Promise<string>} Returns a Promise of endpoint's param at this index
     */
    async getEndpointParams(endpoint: string):Promise<string[]>{
        return await this.zapRegistry.getEndpointParams({ provider: this.providerOwner, endpoint });
    }

    /**
     * Get the endpoints of a given provider
     * @returns {Promise<string[]>} List of endpoints belong to this provider.
     */
    async getEndpoints(): Promise<string[]> {
        return await this.zapRegistry.getProviderEndpoints(this.providerOwner);
    }

    /**
     * Responds to a specific query from the subscriber by identifying a
     * @param {Respond} e. {queryId, responseParams, dynamic}
     * @param {string} e.queryId - The query identifier to send this response to
     * @param {string[] | number[]} e.responseParams - List of responses returned by provider. Length determines which dispatch response is called
     * @param {boolean} e.dynamic - True if the response contains a dynamic bytes32 array
     * @returns {Promise<txid>} Transaction hash
     */
     async respond({queryId, responseParams, dynamic, gas=DEFAULT_GAS}:Respond):Promise<string>{
        return await this.zapDispatch.respond({queryId, responseParams, dynamic, from: this.providerOwner,gas});
    }


    /**
     * Listen for start subscription events from the Arbiter contract.
     * @param filters :{}
     * @param callback
     */
    listenSubscribes(filters:DataPurchaseEvent={},callback:Function):void {
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapArbiter.listenDataPurchase(thisFilters,callback);
    }


    /**
     *Listen to unsubscription events emitted by the Arbiter contract.
     * @param filters :{}
     * @param callback
     */
    listenUnsubscribes(filters: SubscriptionEndEvent={},callback:Function) :void{
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapArbiter.listenSubscriptionEnd(thisFilters,callback);
    }

    /**
     * Listen to Query events emitted by the Dispatch contract.
     * @param filters : { }
     * @param callback
     */
    listenQueries(filters:Filter={},callback:Function) :void {
        let thisFilters= Object.assign(filters,{
            provider : this.providerOwner
        })
        return this.zapDispatch.listenIncoming(thisFilters,callback);
    }

}
