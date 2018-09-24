import {BaseContract} from "@zapjs/basecontract";
import {Util} from "./utils";
import {TransferType,address,txid,NetworkProviderOptions,BNType} from "@zapjs/types";


 /**
 * @class
 * Provides Represents an interface to the Zap Token ERC20 contract. Enables token transfers, balance lookups, and approvals.
 */

 export class ZapToken extends BaseContract {

     /**
      * @constructor
      * @param {NetworkProviderOptions} n. {artifactDir,networkId,networkProvider}
      * @param {string} n.artifactsDir - Directory where contract ABIs are located
      * @param {number|string} n.networkId - Select which network the contract is located on (mainnet, testnet, private)
      * @param {any} n.networkProvider - Ethereum network provider (e.g. Infura)
      * @example new ZapToken({networkId : 42, networkProvider : web3})
      */

    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj,{artifactName:"ZapToken"}));
    }


    /**
     * Get the Zap Token balance of a given address.
     * @param {address} address  Address to check
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into a Zap balance (wei)
     */
     async balanceOf(address:address) :Promise<string|BNType>{
        return await this.contract.methods.balanceOf(address).call();
    }

    /**
     * Transfers Zap from an address to another address.
     * @param {TransferType} t. {to, amount, from,gas=Util.DEFAULT_GAS}
     * @param {address} t.to - Address of the recipient
     * @param {number} t.amount - Amount of Zap to transfer (wei)
     * @param {address} t.from - Address of the sender
     * @param {number} t.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async send({to, amount, from,gas=Util.DEFAULT_GAS}:TransferType) :Promise<txid>{
        return await this.contract.methods.transfer(to, amount.toString()).send({from,gas});
    }

    /**
     * Allocates Zap Token from the Zap contract owner to an address (ownerOnly).
     * @param {TransferType} t. {to, amount, from,gas=Util.DEFAULT_GAS}
     * @param {address} t.to - Address of the recipient
     * @param {number} t.amount - Amount of Zap to allocate (wei)
     * @param {address} t.from - Address of the sender (must be owner of the Zap contract)
     * @param {number} t.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async allocate({to, amount, from,gas=Util.DEFAULT_GAS}:TransferType):Promise<txid> {
        return await this.contract.methods.allocate(to, amount.toString()).send({from,gas});
    }

    /**
     * Approves the transfer of Zap Token from a holder to another account. Enables the bondage contract to transfer Zap during the bondage process.
     * @param {TransferType} t. {to, amount, from, gas=Util.DEFAULT_GAS}
     * @param {address} t.to - Address of the recipient
     * @param {number} t.amount - Amount of Zap to approve (wei)
     * @param {address} t.from - Address of the sender
     * @param {number} t.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async approve({to, amount, from, gas=Util.DEFAULT_GAS}:TransferType):Promise<txid> {
        const success = await this.contract.methods.approve(to, amount.toString()).send({from,gas});
        if (!success) {
            throw new Error('Failed to approve Bondage transfer');
        }
        return success;
    }
}
