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

 /**
 * @class
 * Provides Represents an interface to the Zap Token ERC20 contract. Enables token transfers, balance lookups, and approvals.
 */

 export class ZapToken extends BaseContract {

    constructor({artifactsDir=undefined,artifactName=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"ZapToken",networkId,networkProvider});
    }

    /**
     * Get the Zap Token balance of a given address.
     * @param {address} address The Ethereum address to check
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into a Zap balance (wei)
     */
     async balanceOf(address:address) :Promise<number>{
        let balance = await this.contract.methods.balanceOf(address).call();
        return Utils.fromZapBase(balance);
    }

    /**
     * Transfers Zap from an address to another address.
     * @param {address} to The Ethereum address of the recipient
     * @param {number} amount The amount of Zap to transfer (wei)
     * @param {address} from The Ethereum address of the sender
     * @param {number} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async send({to, amount, from,gas=Utils.Constants.DEFAULT_GAS}:TransferType) :Promise<txid>{
        let bigAmount = Utils.toZapBase(amount);
        return await this.contract.methods.transfer(to, bigAmount).send({from,gas});
    }

    /**
     * Allocates Zap Token from the Zap contract owner to an address (ownerOnly).
     * @param {address} to The Ethereum address of the recipient
     * @param {number} amount The amount of Zap to allocate (wei)
     * @param {address} from The Ethereum address of the sender (must be owner of the Zap contract)
     * @param {number} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async allocate({to, amount, from,gas=Utils.Constants.DEFAULT_GAS}:TransferType):Promise<txid> {
        let bigAmount = Utils.toZapBase(amount)
        return await this.contract.methods.allocate(to, bigAmount).send({from,gas});
    }

    /**
     * Approves the transfer of Zap Token from a holder to another account. Enables the bondage contract to transfer Zap during the bondage process.
     * @param {address} to The Ethereum address of the recipient
     * @param {number} amount The amount of Zap to approve (wei)
     * @param {address} from The Ethereum address of the sender
     * @param {number} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async approve({to, amount, from, gas=Utils.Constants.DEFAULT_GAS}:TransferType):Promise<txid> {
        const success = await this.contract.methods.approve(to, amount).send({from,gas});
        if (!success) {
            throw new Error('Failed to approve Bondage transfer');
        }
        return success;
    }
}
