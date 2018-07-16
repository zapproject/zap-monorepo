const EventEmitter = require('events');
const assert = require('assert');
import {BondType,UnbondType,SubscribeType,SubscriberConstructorType,SubscriberHandler} from "./types";
import { DEFAULT_GAS } from "../node_modules/@zap/utils";

/**
 * Subscriber class, Provides methods for subscribers
 * @param {string} owner
 * @param {any} handler
 * @param {} zapToken
 * @param {} zapRegistry
 * @param {} zapDispatch
 * @param {} zapBondage
 * @param {} zapArbiter
 */
export class Subscriber extends EventEmitter {

    constructor({owner,handler,zapToken,zapRegistry,zapDispatch,zapBondage,zapArbiter}:SubscriberConstructorType) {
        super();
        assert(owner, 'owner address is required');
        this.subscriberOwner = owner;
        this.handler = handler || {};
        this.zapToken = zapToken;
        this.zapDispatch = zapDispatch;
        this.zapBondage = zapBondage;
        this.zapArbiter = zapArbiter;
        this.zapRegistry = zapRegistry;
    }


    async bond({provider, endpoint, zapNum}:BondType){
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

    async unBond({provider, endpoint, dots}:UnbondType){
        let boundDots = await this.zapBondage.getBoundDots({subscriber: this.subscriberOwner, provider, endpoint});
        assert(boundDots >= dots, 'dots to unbond is less than requested');
        let unBounded = await this.zapBondage.unbond({provider, endpoint, dots, from: this.subscriberOwner});
        return unBounded;
    }


    async subscribe({provider, endpoint, endpointParams, dots}:SubscribeType):Promise<any> {
        let providerPubkey = await this.zapRegistry.getProviderPublicKey({provider});
        let zapRequired = await this.zapBondage.calcZapForDots({provider, endpoint, dots});
        let zapBalance = await this.zapToken.balanceOf(this.subscriberOwner);
        if (zapBalance < zapRequired)
            throw new Error(`Insufficient balance, require ${zapRequired} Zap for ${dots} dots`);
        let boundDots = await this.zapBondage.bond({provider, endpoint, numZap: zapRequired, from: this.subscriberOwner});
        assert.isEqual(boundDots, dots, 'Bound dots is different to dots requests.');
        let blocks = dots;
        let sub = await this.zapArbiter.initiateSubscription(
            {provider, endpoint, endpointParams,
                blocks: blocks, publicKey: providerPubkey, from: this.subscriberOwner});
        return sub;
    }

    // === Helpers ===//
    async hasEnoughZap(zapRequired:number):Promise<boolean>{
        let balance = await this.zapToken.balanceOf(this.subscriberOwner);
        return balance > zapRequired;
    }

}

