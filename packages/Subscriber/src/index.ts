
const assert = require('assert');
import {BondType,UnbondType,SubscribeType,SubscriberConstructorType,SubscriberHandler} from "./types";
import {ZapDispatch} from "@zap/dispatch";
import {ZapRegistry} from "@zap/registry";
import {ZapBondage} from "@zap/bondage";
import {ZapArbiter} from "@zap/arbiter";
import {ZapToken} from "@zap/zaptoken";


export class Subscriber  {
    subscriberOwner:string;
    handler : SubscriberHandler;
    zapDispatch : ZapDispatch;
    zapBondage : ZapBondage;
    zapArbiter : ZapArbiter;
    zapRegistry:  ZapRegistry;
    zapToken: ZapToken;

    constructor({owner,handler,zapToken,zapRegistry,zapDispatch,zapBondage,zapArbiter}:SubscriberConstructorType) {
        assert(owner, 'owner address is required');
        this.subscriberOwner = owner;
        this.handler = handler || {};
        this.zapToken = zapToken;
        this.zapDispatch = zapDispatch;
        this.zapBondage = zapBondage;
        this.zapArbiter = zapArbiter;
        this.zapRegistry = zapRegistry;
    }


    /**
     *
     * @param {string} provider
     * @param {string} endpoint
     * @param {number} zapNum
     * @returns {Promise<any>}
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
     *
     * @param {string} provider
     * @param {string} endpoint
     * @param {number} dots
     * @returns {Promise<any>}
     */
    async unBond({provider, endpoint, dots}:UnbondType):Promise<any>{
        let boundDots = await this.zapBondage.getBoundDots({subscriber: this.subscriberOwner, provider, endpoint});
        assert(boundDots >= dots, 'dots to unbond is less than requested');
        let unBounded = await this.zapBondage.unbond({provider, endpoint, dots, from: this.subscriberOwner});
        return unBounded;
    }


    /**
     *
     * @param {string} provider
     * @param {string} endpoint
     * @param {string[]} endpointParams
     * @param {number} dots
     * @returns {Promise<any>}
     */
    async subscribe({provider, endpoint, endpointParams, dots}:SubscribeType):Promise<any> {
        let providerPubkey = await this.zapRegistry.getProviderPublicKey(provider);
        let zapRequired = await this.zapBondage.calcZapForDots({provider, endpoint, dots});
        let zapBalance = await this.zapToken.balanceOf(this.subscriberOwner);
        if (zapBalance < zapRequired)
            throw new Error(`Insufficient balance, require ${zapRequired} Zap for ${dots} dots`);
        let boundDots = await this.zapBondage.bond({provider, endpoint, zapNum: zapRequired, from: this.subscriberOwner});
        assert.isEqual(boundDots, dots, 'Bound dots is different to dots requests.');
        let blocks = dots;
        let sub = await this.zapArbiter.initiateSubscription(
            {provider, endpoint, endpoint_params:endpointParams,
                blocks: blocks, pubkey: providerPubkey, from: this.subscriberOwner});
        return sub;
    }

    // === Helpers ===//
    /**
     *
     * @param {number} zapRequired
     * @returns {Promise<boolean>}
     */
    async hasEnoughZap(zapRequired:number):Promise<boolean>{
        let balance = await this.zapToken.balanceOf(this.subscriberOwner);
        return balance > zapRequired;
    }

}

