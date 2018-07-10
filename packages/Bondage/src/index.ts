import {BaseContract,BaseContractType} from '@zap/basecontract'
import {BondArgs,UnbondArgs,BondageArgs} from "./types";
import {toBase} from '@zap/utils';
import * as assert from 'assert';
const {toBN, utf8ToHex} = require("web3-utils");
import {DEFAULT_GAS} from "@zap/utils";

class ZapBondage extends BaseContract {


    constructor({artifactsDir=undefined,artifactName=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"Bondage",networkId,networkProvider});
    }
    // Do a bond to a ZapOracle's endpoint
    async bond({provider, endpoint, zapNum, from, gas=DEFAULT_GAS}:BondArgs) {
        try{
            assert(zapNum && zapNum>0,"Zap to Bond must be greater than 0");
            let bondResult = await this.contract.bond(
                provider,
                utf8ToHex(endpoint),
                toBase(zapNum))
                .send({from,gas});
            return bondResult;
        }catch(e){
            console.error(e);
            return 0;
        }

    }


    async unbond({provider, endpoint, dots, from, gas=DEFAULT_GAS}:UnbondArgs) {
        return await this.contract.methods.unbond(
            provider,
            utf8ToHex(endpoint),
            toBN(dots))
            .send({from,gas});
    }

    async getBoundDots({subscriber, provider, endpoint}:BondageArgs) {
        return await this.contract.methods.getBoundDots(
            subscriber,
            provider,
            this.web3.utils.utf8ToHex(endpoint),
        ).call();
    }

    async calcZapForDots({provider, endpoint, dots}:BondageArgs){
        return await this.contract.methods.calcZapForDots(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)).call().valueOf();
    }

    async calcBondRate({provider, endpoint, zapNum}:BondageArgs){
        return await this.contract.methods.calcBondRate(
            provider,
            utf8ToHex(endpoint),
            toBN(zapNum)
        ).call();
    }

    async currentCostOfDot({provider, endpoint, dots}:BondageArgs){
        return this.contract.methods.currentCostOfDot(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)
        ).call();
    }

    async getDotsIssued({provider, endpoint}:BondageArgs){
        return this.contract.methods.getDotsIssued(
            provider,
            utf8ToHex(endpoint)
        ).call();
    }

    async getZapBound({provider, endpoint} :BondageArgs ){
        return this.contract.methods.getZapBound(
            provider,
            utf8ToHex(endpoint)
        ).call();
    }

    listen(filters:any = {}, callback:Function){
        this.contract.events.allEvents(filters, {fromBlock: 0, toBlock: 'latest'}, callback);
    }

    listenBound(filters :any = {}, callback :Function){
        this.contract.events.Bound(filters, {toBlock: 'latest'}, callback);
    }

    listenUnbound(filters:any = {} , callback :Function){
        this.contract.events.Unbond(filters, {toBlock: 'latest'}, callback);
    }

    listenEscrowed(filters :any = {}, callback:Function){
        this.contract.events.Escrowed(filters, {toBlock: 'latest'}, callback);
    }

    listenReleased(filters :any = {}, callback :Function){
        this.contract.events.Released(filters, {toBlock: 'latest'}, callback);
    }

}

export default  ZapBondage
