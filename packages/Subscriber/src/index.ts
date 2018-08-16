import {Filter} from "@zapjs/types/lib";

const assert = require('assert');
import {BondType,UnbondType,SubscribeType,QueryArgs} from "./types";
import {txid,address,NetworkProviderOptions,DEFAULT_GAS,BNType} from "@zapjs/types";
import {ZapDispatch} from "@zapjs/dispatch";
import {ZapRegistry} from "@zapjs/registry";
import {ZapBondage} from "@zapjs/bondage";
import {ZapArbiter} from "@zapjs/arbiter";
import {ZapToken} from "@zapjs/zaptoken";

/**
 * @class
 * Represents an offchain Subscriber and provides an interface to the appropriate smart contracts.
 */
export class ZapSubscriber  {
    subscriberOwner:string;
    zapDispatch : ZapDispatch;
    zapBondage : ZapBondage;
    zapArbiter : ZapArbiter;
    zapRegistry:  ZapRegistry;
    zapToken: ZapToken;

    constructor(owner:string,options:NetworkProviderOptions) {
        assert(owner, 'owner address is required');
        this.subscriberOwner = owner;
        this.zapToken = new ZapToken(options);
        this.zapDispatch = new ZapDispatch(options);
        this.zapBondage = new ZapBondage(options);
        this.zapArbiter = new ZapArbiter(options);
        this.zapRegistry = new ZapRegistry(options);
    }

    /**
      * Gets the Zap balance of the current ZapSubscriber
      * @returns {Promise<string|BigNumber>} Returns a Promsie that will be eventually resolved with the number of wei Zap
      */
    async getZapBalance(): Promise<string|BNType> {
        return await this.zapToken.balanceOf(this.subscriberOwner);
    }

    async approveToBond(provider:address,zapNum:BNType):Promise<any>{
        let approve = await this.zapToken.approve({
            to: this.zapBondage.contract._address,
            amount: zapNum,
            from: this.subscriberOwner
        });

        return approve
    }
    /**
     * Bonds zapNum amount of Zap to the given provider's endpoint, yielding dots that enable this subscriber to send queries. 
     * @param {string} provider The address of the oracle
     * @param {string} endpoint The endpoint that this client wants to query from
     * @param {number} zapNum The amount of Zap (in wei) to bond
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async bond({provider, endpoint, dots}:BondType):Promise<any>{
       // assert.ok(this.hasEnoughZap(zapNum), 'Insufficient Balance');
        let zapRequire = await this.zapBondage.calcZapForDots({provider,endpoint,dots})
        let approve = await this.zapToken.approve({
            to: this.zapBondage.contract._address,
            amount: zapRequire,
            from: this.subscriberOwner
        });

        //assert.ok(approve, 'fail to approve to Bondage');
        const bonded = await this.zapBondage.bond({
            provider: provider,
            endpoint: endpoint,
            dots: dots,
            from: this.subscriberOwner
        });
    
        // return bonded;
        return bonded;
    }

    /**
     * Unbonds a given number of dots from a given oracle, returning Zap to this subscriber based on the bonding curve.
     * @param {string} provider The address of the oracle
     * @param {string} endpoint The endpoint that the client has already bonded to
     * @param {string|number} dots The number of dots to unbond (redeem) from this provider and endpoint
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async unBond({provider, endpoint, dots}:UnbondType):Promise<any>{
        let boundDots = await this.zapBondage.getBoundDots({subscriber: this.subscriberOwner, provider, endpoint});
        assert(boundDots >= dots, 'dots to unbond is less than requested');
        let unBounded = await this.zapBondage.unbond({provider, endpoint, dots, from: this.subscriberOwner});
        return unBounded;
    }

    /**
     * Initializes a temporal subscription to an oracle, defined in terms of # of blocks. 
     * @param {string} provider The address of the oracle
     * @param {string} endpoint The endpoint that the client will query from
     * @param {string[]} endpointParams The parameters passed to the oracle
     * @param {number} dots The number of dots to subscribe for, determining the number of blocks this temporal subscription will last for
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async subscribe({provider, endpoint, endpointParams, dots}:SubscribeType):Promise<any> {
        let providerPubkey = await this.zapRegistry.getProviderPublicKey(provider);
        let zapRequired = await this.zapBondage.calcZapForDots({provider, endpoint, dots});
        let zapBalance = await this.zapToken.balanceOf(this.subscriberOwner);
        if (zapBalance < zapRequired)
            throw new Error(`Insufficient balance, require ${zapRequired} Zap for ${dots} dots`);
        let boundDots = await this.zapBondage.getBoundDots({provider, endpoint, subscriber: this.subscriberOwner});
        if(boundDots<dots)
            throw new Error(`Insufficient bound dots, please bond ${dots} dots to subscribe`)
        let blocks = dots;
        let sub = await this.zapArbiter.initiateSubscription(
            {provider, endpoint, endpoint_params:endpointParams,
                blocks: blocks, pubkey: providerPubkey, from: this.subscriberOwner});
        return sub;
    }

   /**
     * Queries data from a subscriber to a given provider's endpoint, passing in a query string and endpoint parameters that will be processed by the oracle.
     * @param {address} provider Address of the data provider
     * @param {string} query Subscriber given query string to be handled by provider
     * @param {string} endpoint Data endpoint of provider, meant to determine how query is handled
     * @param {Array<string>} endpointParams Parameters passed to data provider's endpoint
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async queryData({provider, query, endpoint, endpointParams}: QueryArgs): Promise<any> {
        let boundDots = await this.zapBondage.getBoundDots({provider,endpoint,subscriber:this.subscriberOwner})
        
        if ( !boundDots ) {
            throw new Error("Insufficient balance of bound dots to query")
        }

        return await this.zapDispatch.queryData({provider, query, endpoint, endpointParams, from: this.subscriberOwner, gas: DEFAULT_GAS});
    }


    /**
     * Listen to all Offchain responses events
     * @param filter
     * @param callback
     */
    async listenToOffchainResponse(filter:Filter,callback:Function){
        if(!filter['subscriber'])
            filter = {...filter,subscriber:this.subscriberOwner}
        this.zapDispatch.listenOffchainResponse(filter,callback)


    }

    // === Helpers ===//
    /**
     * Checks the Zap balance of the subscriber and compares it to a given amount.
     * @param {number} zapRequired The number of zap to check for
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve into a true or false value
     */
    async hasEnoughZap(zapRequired:string|BNType):Promise<boolean>{
        let balance = await this.zapToken.balanceOf(this.subscriberOwner);
        return balance >= zapRequired;
    }
}

