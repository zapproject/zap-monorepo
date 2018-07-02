const basecontract=  require('basecontract')
import {BondageArgs} from "./types";
import {toBase} from '@zap/utils'
import assert;

class Bondage extends basecontract {


    constructor({networkId=null,networkProvider=null}={}){
        super({contract:"Bondage",networkId,networkProvider});
    }
    // Do a bond to a ZapOracle's endpoint
    async bond({provider, endpoint, zapNum, from, gas}:BondageArgs) {
        try{
            assert(zapNum && zapNum>0,"Zap to Bond must be greater than 0");
            let bondResult = await this.contract.bond(
                provider,
                this.web3.utils.utf8ToHex(endpoint),
                toBase(zapNum))
                .send({
                    from: from,
                    gas: gas || this.DEFAULT_GAS});
            return bondResult;
        }catch(e){
            console.error(e);
            return 0;
        }

    }


    async unbond({provider, endpoint, dots, from, gas}:BondageArgs) {
        return await this.contract.methods.unbond(
            provider,
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(dots))
            .send({
                from: from,
                gas: gas || this.DEFAULT_GAS});
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
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(dots)).call();
    }

    async calcBondRate({provider, endpoint, zapNum}:BondageArgs){
        return await this.contract.methods.calcBondRate(
            provider,
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(zapNum)
        ).call();
    }

    async currentCostOfDot({provider, endpoint, totalBound}:BondageArgs){
        return this.contract.methods.currentCostOfDot(
            provider,
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(totalBound)
        ).call();
    }

    async getDotsIssued({provider, endpoint}:BondageArgs){
        return this.contract.methods.getDotsIssued(
            provider,
            this.web3.utils.utf8ToHex(endpoint)
        ).call();
    }

    async getZapBound({provider, endpoint} :BondageArgs ){
        return this.contract.methods.getZapBound(
            provider,
            this.web3.utils.utf8ToHex(endpoint)
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

module.exports = new Bondage();
