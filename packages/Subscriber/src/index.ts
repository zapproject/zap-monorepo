import {Filter} from "@zapjs/types/lib";

const assert = require('assert');
const utils = require("web3-utils");
import {BondType, UnbondType, SubscribeType, QueryArgs, DelegateBondType,ApproveType,
    txid,address,NetworkProviderOptions,DEFAULT_GAS,BNType,
    OffchainResponse,
    NumType,
    cancelQuery,
    BondageArgs
} from "@zapjs/types";
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

    /**
     * @constructor
     * @param {string} owner Susbcriber owner's address
     * @param {NetworkProviderOptions} options network provider options
     * @example new ZapSubscriber(owner,{networkId:42,networkProvider:web3})
     *
     */
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
      * @returns {Promise<string|BigNumber>} Zap Balance in wei
      */
    async getZapBalance(): Promise<string|BNType> {
        return await this.zapToken.balanceOf(this.subscriberOwner);
    }

    /**
      * Gets the Zap allowance of the current ZapSubscriber to Bondage
      * @returns {Promise<string|BigNumber>} Zap Allowance in wei
      */
    async getZapAllowance(): Promise<string|BNType>{
        return await this.zapToken.contract.methods.allowance(this.subscriberOwner, this.zapBondage.contract._address).call()
    }

    /**
     * Approve number of zap to a provider
     * @param {string} provider- Provider's address
     * @param {number|BigNumber}zapNum - Number of Zap to approve
     * @param {number|string} gas - number of gas Limit
     */
    async approveToBond({provider,zapNum,gasPrice,gas=DEFAULT_GAS}:ApproveType):Promise<any>{
       return await this.zapToken.approve({
            to: this.zapBondage.contract._address,
            amount: zapNum,
            from: this.subscriberOwner,
            gas,
            gasPrice
        });
    }
    /**
     * Bonds zapNum amount of Zap to the given provider's endpoint, yielding dots that enable this subscriber to send queries.
     * @param {BondType} b. {provider, endpoint, dots}
     * @param {string} b.provider - Provider's address
     * @param {string} b.endpoint - Endpoint that this client wants to query from
     * @param {number} b.dots - Amount of dots to bond
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async bond({provider, endpoint, dots,gasPrice, gas=DEFAULT_GAS}:BondType, cb?:Function):Promise<any>{
       // assert.ok(this.hasEnoughZap(zapNum), 'Insufficient Balance');
       const approved = utils.toBN(await this.zapToken.contract.methods.allowance(this.subscriberOwner, this.zapBondage.contract._address).call());
       const required = utils.toBN(await this.zapBondage.calcZapForDots({ provider, endpoint, dots }));
       const zapBalance = utils.toBN(await this.getZapBalance());

       assert(approved.gte(required), 'You don\'t have enough ZAP approved.');
       assert(zapBalance.gte(required), 'Balance insufficent.');

        const bonded = await this.zapBondage.bond({
            provider,
            endpoint,
            dots,
            gas,
            gasPrice,
            from: this.subscriberOwner
        }, cb);
        return bonded;
    }

    /**
     * Delegate bonds zapNum amount of Zap to the given provider's endpoint, yielding dots that enable given subscriber to send queries.
     * @param {BondType} b. {provider, endpoint, dots}
     * @param {address} b.provider - Provider's address
     * @param {address} b.subscriber - subscriber's address that will bond with provider's endpoint
     * @param {string} b.endpoint - Endpoint that this client wants to query from
     * @param {number} b.dots - Amount of dots to bond
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async delegateBond({provider, subscriber,endpoint, dots,gasPrice, gas=DEFAULT_GAS}:DelegateBondType, cb?: Function):Promise<any>{
        // assert.ok(this.hasEnoughZap(zapNum), 'Insufficient Balance');
        const approved = utils.toBN(await this.zapToken.contract.methods.allowance(this.subscriberOwner, this.zapBondage.contract._address).call());
        const required = utils.toBN(await this.zapBondage.calcZapForDots({ provider, endpoint, dots }));
        const zapBalance = utils.toBN(await this.getZapBalance());

        assert(approved.gte(required), 'You don\'t have enough ZAP approved.');
        assert(zapBalance.gte(required), 'Balance insufficent.');
        const bonded = await this.zapBondage.delegateBond({
            provider,
            endpoint,
            dots,
            subscriber,
            from: this.subscriberOwner,
            gas,
            gasPrice
        }, cb);
        return bonded;
    }

    /**
     * Unbonds a given number of dots from a given oracle, returning Zap to this subscriber based on the bonding curve.
     * @param {UnbondType} u. {provider, endpoint, dots}
     * @param {string} u.provider - Oracle's address
     * @param {string} u.endpoint - Endpoint that the client has already bonded to
     * @param {string|number} u.dots - Number of dots to unbond (redeem) from this provider and endpoint
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Transaction hash
     */
    async unBond({provider, endpoint, dots,gasPrice,gas=DEFAULT_GAS}:UnbondType, cb?: Function):Promise<any>{
        let boundDots = await this.zapBondage.getBoundDots({subscriber: this.subscriberOwner, provider, endpoint});
        assert(parseInt(boundDots.toString()) >= parseInt(dots.toString()), 'dots to unbond is less than requested');
        return  await this.zapBondage.unbond({provider, endpoint, dots, from: this.subscriberOwner,gas,gasPrice}, cb);
    }

    /**
     * Initializes a temporal subscription to an oracle, defined in terms of # of blocks.
     * @param {SubscribeType} s. {provider, endpoint, endpointParams, dots}
     * @param {string} s.provider - Oracle's address
     * @param {string} s.endpoint - Endpoint that the client will query from
     * @param {string[]} s.endpointParams - The parameters passed to the oracle
     * @param {number} s.dots - Number of dots to subscribe for, determining the number of blocks this temporal subscription will last for
     * @returns {Promise<txid>} Transaction hash
     */
    async subscribe({provider, endpoint, endpointParams, dots,gasPrice,gas=DEFAULT_GAS}:SubscribeType):Promise<any> {
        let providerPubkey = await this.zapRegistry.getProviderPublicKey(provider);
        let zapRequired = await this.zapBondage.calcZapForDots({provider, endpoint, dots});
        let zapBalance = await this.zapToken.balanceOf(this.subscriberOwner);
        if (zapBalance < zapRequired)
            throw new Error(`Insufficient balance, require ${zapRequired} Zap for ${dots} dots`);
        let boundDots = await this.zapBondage.getBoundDots({provider, endpoint, subscriber: this.subscriberOwner});
        if(parseInt(boundDots.toString())<parseInt(dots.toString()))
            throw new Error(`Insufficient bound dots, please bond ${dots} dots to subscribe`)
        let blocks = dots;
        let sub = await this.zapArbiter.initiateSubscription(
            {provider, endpoint, endpoint_params:endpointParams,
                blocks: blocks, pubkey: providerPubkey, from: this.subscriberOwner,gas,gasPrice});
        return sub;
    }

   /**
     * Queries data from a subscriber to a given provider's endpoint, passing in a query string and endpoint parameters that will be processed by the oracle.
    * @param {QueryArgs} q. {provider, query, endpoint, endpointParams}
     * @param {address} q.provider - Oracle's address
     * @param {string} q.query - Query string given to be handled by provider
     * @param {string} q.endpoint - Data endpoint of provider, meant to determine how query is handled
     * @param {Array<string>} q.endpointParams - Parameters passed to data provider's endpoint
     * @returns {Promise<txid>} Transaction hash
     */
    async queryData({provider, query, endpoint, endpointParams,gasPrice, gas=DEFAULT_GAS}: QueryArgs): Promise<any> {
        let boundDots = await this.zapBondage.getBoundDots({provider,endpoint,subscriber:this.subscriberOwner})
        if ( !boundDots ) {
            throw new Error("Insufficient balance of bound dots to query")
        }
        return await this.zapDispatch.queryData({provider, query, endpoint, endpointParams, from: this.subscriberOwner, gas,gasPrice});
    }

    /**
     * Cancel a queryId
     * @param queryId : string|number
     * @param gas (optional)
     * @returns {Promise<number|string>} block number that query was successfully canceled. or 0 if failed
     */
    async cancelQuery({queryId, gasPrice, gas=DEFAULT_GAS}:cancelQuery): Promise<number|string>{
        return await this.zapDispatch.cancelQuery({queryId,from:this.subscriberOwner,gas,gasPrice})
    }

    /****************************** GETTERS *****************************/

    /**
     * Get Number of dots escrow
     * @param provider
     * @param endpoint
     * @returns Number of escrow dots
     */
    async getNumEscrow({provider,endpoint}:BondageArgs) :Promise<number|string>{
        return await this.zapBondage.getNumEscrow({
            subscriber:this.subscriberOwner
            ,provider,endpoint});
    }

    /**
     * Gets the number of dots that are bounded to a provider's endpoint for the current subscriber.
     * @param {BondageArgs} bond. {subscriber, provider, endpoint}
     * @param {address} bond.provider  - Address of the data provider
     * @param {string} bond.endpoint - Data endpoint of the provider
     * @returns {Promise<string|BigNumber>} Number of bound dots to this provider's endpoint
     */
    public async getBoundDots({provider, endpoint}: BondageArgs): Promise<NumType> {
        return await this.zapBondage.getBoundDots({
            subscriber:this.subscriberOwner,
            provider,
            endpoint});
    }


    /**
     * Listen to all Offchain responses events
     * @param filter
     * @param callback
     */
    async listenToOffchainResponse(filter:OffchainResponse={},callback:Function){
        if(!filter['subscriber'])
            filter = {...filter,subscriber:this.subscriberOwner}
        this.zapDispatch.listenOffchainResponse(filter,callback)


    }

    // === Helpers ===//
    /**
     * Checks the Zap balance of the subscriber and compares it to a given amount.
     * @param {number} zapRequired  - Number of zap to check for
     * @returns {Promise<boolean>} boolean of there is enough Zap
     */
    async hasEnoughZap(zapRequired:string|BNType):Promise<boolean>{
        let balance = await this.zapToken.balanceOf(this.subscriberOwner);
        return balance >= zapRequired;
    }
}
