const basecontract = require('basecontract');
import {toBase,fromBase} from "@zap/utils";
import {TransferType} from "./types";

class ZapToken extends basecontract {

    constructor({networkId=null,networkProvider=null}={}){
        super({contract:"ZapToken",networkId,networkProvider});
    }

    async balanceOf(address:string) {
        let balance = await this.contract.methods.balanceOf(address).call();
        return fromBase(balance);
    }

    async send({to, amount, from}:TransferType) {
        let bigAmount = toBase(amount)
        return await this.contract.methods.transfer(to, bigAmount).send({from});
    }

    async allocate({to, amount, from}:TransferType) {
        let bigAmount = toBase(amount)
        return await this.contract.methods.allocate(to, bigAmount).send({from: from});
    }

    async approve({to, amount, from}:TransferType) {
        let bigAmount = toBase(amount);
        const success = await this.contract.methods.approve(to, bigAmount).send({from: from});
        if (!success) {
            throw new Error('Failed to approve Bondage transfer');
        }
        return success;
    }
}

module.exports = ZapToken;
