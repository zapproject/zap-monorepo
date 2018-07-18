import {BaseContract,BaseContractType} from "@zap/basecontract";
import {Utils} from "@zap/utils";
import {TransferType,address,txid} from "./types";

/**
 * ERC20 Tokens methods for Zap Tokens
 * @extends BaseContract
 * @param {?string} artifactsDir
 * @param {string} artifactName
 * @param {?string} networkId
 * @param {?string} networkProvider

 */
export class ZapToken extends BaseContract {


    constructor({artifactsDir=undefined,artifactName=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"ZapToken",networkId,networkProvider});
    }

    /**
     * Get Zap Token balance of address
     * @param {address} address
     * @returns {Promise<number>} Zap balance
     */
    async balanceOf(address:address) :Promise<number>{
        let balance = await this.contract.methods.balanceOf(address).call();
        return Utils.fromZapBase(balance);
    }

    /**
     * Transfer Zap Token
     * @param {address} to
     * @param {number} amount
     * @param {address} from
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async send({to, amount, from,gas=Utils.Constants.DEFAULT_GAS}:TransferType) :Promise<txid>{
        let bigAmount = Utils.toZapBase(amount);
        return await this.contract.methods.transfer(to, bigAmount).send({from,gas});
    }

    /**
     * Allocate Zap Token from Zap contract owner to an address
     * @param {address} to
     * @param {number} amount
     * @param {address} from
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async allocate({to, amount, from,gas=Utils.Constants.DEFAULT_GAS}:TransferType):Promise<txid> {
        let bigAmount = Utils.toZapBase(amount)
        return await this.contract.methods.allocate(to, bigAmount).send({from,gas});
    }

    /**
     * Approve Zap Token to an address
     * @param {address} to
     * @param {number} amount
     * @param {address} from
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async approve({to, amount, from, gas=Utils.Constants.DEFAULT_GAS}:TransferType):Promise<txid> {
        const success = await this.contract.methods.approve(to, amount).send({from,gas});
        if (!success) {
            throw new Error('Failed to approve Bondage transfer');
        }
        return success;
    }
}
