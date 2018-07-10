import {BaseContract,BaseContractType} from "@zap/basecontract";
import {toZapBase, fromZapBase,DEFAULT_GAS} from "@zap/utils";
import {TransferType} from "./types";

class ZapToken extends BaseContract {

    constructor({artifactsDir=undefined,artifactName=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"ZapToken",networkId,networkProvider});
    }

    async balanceOf(address:string) {
        let balance = await this.contract.methods.balanceOf(address).call();
        return fromZapBase(balance);
    }

    async send({to, amount, from,gas=DEFAULT_GAS}:TransferType) {
        let bigAmount = toZapBase(amount);
        return await this.contract.methods.transfer(to, bigAmount).send({from,gas});
    }

    async allocate({to, amount, from,gas=DEFAULT_GAS}:TransferType) {
        let bigAmount = toZapBase(amount)
        return await this.contract.methods.allocate(to, bigAmount).send({from,gas});
    }

    async approve({to, amount, from,gas=DEFAULT_GAS}:TransferType) {
        let bigAmount = toZapBase(amount);
        const success = await this.contract.methods.approve(to, bigAmount).send({from,gas});
        if (!success) {
            throw new Error('Failed to approve Bondage transfer');
        }
        return success;
    }
}

module.exports = ZapToken;
