
const assert = require('assert');
import {BondType,UnbondType,SubscribeType} from "./types";
import {txid,address,NetworkProviderOptions} from "@zapjs/types";
import {ZapDispatch} from "@zapjs/dispatch1";
import {ZapRegistry} from "@zapjs/registry1";
import {ZapBondage} from "@zapjs/bondage1";
import {ZapArbiter} from "@zapjs/arbiter1";
import {ZapToken} from "@zapjs/zaptoken1";

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

    async approveToBond(provider:address,zapNum:number):Promise<any>{
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
    async bond({provider, endpoint, zapNum}:BondType):Promise<any>{
       // assert.ok(this.hasEnoughZap(zapNum), 'Insufficient Balance');
        let approve = await this.zapToken.approve({
            to: this.zapBondage.contract._address,
            amount: zapNum,
            from: this.subscriberOwner
        });

        //assert.ok(approve, 'fail to approve to Bondage');
        const bonded = await this.zapBondage.bond({
            provider: provider,
            endpoint: endpoint,
            zapNum: zapNum,
            from: this.subscriberOwner
        });
    
        // return bonded;
        return bonded;
    }

    /**
     * Unbonds a given number of dots from a given oracle, returning Zap to this subscriber based on the bonding curve.
     * @param {string} provider The address of the oracle
     * @param {string} endpoint The endpoint that the client has already bonded to
     * @param {number} dots The number of dots to unbond (redeem) from this provider and endpoint
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
        let boundDots = await this.zapBondage.bond({provider, endpoint, zapNum: zapRequired, from: this.subscriberOwner});
        let blocks = dots;
        let sub = await this.zapArbiter.initiateSubscription(
            {provider, endpoint, endpoint_params:endpointParams,
                blocks: blocks, pubkey: providerPubkey, from: this.subscriberOwner});
        return sub;
    }

    // === Helpers ===//
    /**
     * Checks the Zap balance of the subscriber and compares it to a given amount.
     * @param {number} zapRequired The number of zap to check for
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve into a true or false value
     */
    async hasEnoughZap(zapRequired:number):Promise<boolean>{
        let balance = await this.zapToken.balanceOf(this.subscriberOwner);
        return balance >= zapRequired;
    }
}

