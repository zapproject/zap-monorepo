const EventEmitter = require('events');
const assert = require('assert');
import {ZapDispatch} from "@zap/dispatch;
import{ZapToken} from '@zap/zaptoken';
import {ZapBondage} from "@zap/bondage;
import{ZapArbiter} from '@zap/arbiter';
import {ZapRegistry} from "@zap/registry"
import {BondType,UnbondType,SubscribeType} from "./types";


class Subscriber extends EventEmitter {

    constructor({owner, handler}:{owner:string,handler:any}) {
        super();
        assert(owner, 'owner address is required');
        this.owner = owner;
        this.handler = handler || {};
    }

    // Add a endpoint handler
    addHandler(type:string, handler:any) {
        this.handlers[type] = handler;
    }


    async bond({provider, endpoint, zapNum}:BondType){
        assert(provider && endpoint && zapNum,
            'missing args, require: provider,endpoint,zapNum');
        assert(this.hasEnoughZap(zapNum), 'Insufficient Balance');
        let approve = await ZapToken.approve({
            address: ZapBondage.contract._address,
            amount: zapNum, from: this.owner});
        assert(approve, 'fail to approve to Bondage');
        let bonded = await ZapBondage.bond({provider, endpoint, zapNum, from: this.owner});
        return bonded;
    }

    async unBond({provider, endpoint, dots}:UnbondType){
        let boundDots = await ZapBondage.getBoundDots({subscriber: this.owner, provider, endpoint});
        assert(boundDots >= dots, 'dots to unbond is less than requested');
        let unBounded = await ZapBondage.unbond({provider, endpoint, dots, from: this.owner});
        return unBounded;
    }


    async subscribe({provider, endpoint, endpointParams, dots}:SubscribeType):void {
        try {
            let providerPubkey = await ZapRegistry.getProviderPublicKey({provider});
            let zapRequired = await ZapBondage.calcZapForDots({provider, endpoint, dots});
            let zapBalance = await ZapToken.balanceOf(this.owner);
            if (zapBalance < zapRequired)
                throw new Error(`Insufficient balance, require ${zapRequired} Zap for ${dots} dots`);
            let boundDots = await ZapBondage.bond({provider, endpoint, numZap: zapRequired, from: this.owner});
            assert.isEqual(boundDots, dots, 'Bound dots is different to dots requests.');
            let blocks = dots;
            let sub = await ZapArbiter.initiateSubscription(
                {provider, endpoint, endpointParams,
                    blocks: blocks, publicKey: providerPubkey, from: this.owner});
            return sub;
        } catch (e){
            console.error(e);
            return null;
        }
    }

    // === Helpers ===//
    async hasEnoughZap(zapRequired:number):boolean{
        let balance = await ZapToken.balanceOf(this.owner);
        return balance > zapRequired;
    }

}

module.exports = Subscriber;
