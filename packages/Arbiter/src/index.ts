import  {BaseContract,BaseContractType} from '@zap/basecontract';
import {SubscriptionInit,SubscriptionEnd,Filter,SubscriptionType,txid} from "./types"
const {toBN,utf8ToHex} = require ('web3-utils');
import {Utils} from "@zap/utils"

/**
 * @class
 * Provides interface to  Arbiter contract for managing subscriptions activities
 */
export class ZapArbiter extends BaseContract {

    /**
     * @constructor
     * @augments BaseContract
     * @param {string} artifactsDir
     * @param {string} networkId
     * @param  networkProvider : Ethereum network provider
     */
    constructor({artifactsDir, networkId,networkProvider}:BaseContractType){
        super({artifactsDir,artifactName:'Arbiter',networkId,networkProvider});
    }


    /**
     *Start subscription with a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {Array<string>} endpoint_params
     * @param {number} blocks that subscription will last
     * @param {number} provider's public key
     * @param {address} from: subscriber
     * @param {number} gas (optional)
     * @returns {Promise<txid>} txid of initiate transaction
     */
    async initiateSubscription(
        {provider, endpoint, endpoint_params, blocks, pubkey, from, gas=Utils.Constants.DEFAULT_GAS} : SubscriptionInit):Promise<txid> {
        try {
            for (let i in endpoint_params){
                endpoint_params[i] = utf8ToHex(endpoint_params[i]);
            }

            return await this.contract.methods.initiateSubscription(
                provider,
                utf8ToHex(endpoint),
                endpoint_params,
                toBN(pubkey),
                toBN(blocks)).send({from, gas});
        } catch (err) {
            throw err;
        }
    }

    /**
     * @func Get Subscription of a subscriber for a provider's endpoint
     * @param {address} provider
     * @param {address} subscriber
     * @param {string} endpoint
     * @returns {Promise<string>} Subscription Information
     */
    async getSubscription({provider,subscriber,endpoint}:SubscriptionType){
        let subscription = await this.contract.methods.getSubscription(provider,subscriber,utf8ToHex(endpoint)).call();
        console.log("subscription result : ",subscription)
         return subscription

    }

    /**
     * @func Subscriber ends subscription for a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {address} from : subscriber
     * @param {number} gas
     * @returns {Promise<txid>} unsubscribe txid
     */
    async endSubscriptionSubscriber({provider, endpoint, from, gas=Utils.Constants.DEFAULT_GAS}:SubscriptionEnd) :Promise<txid>{
        let unSubscription:any
        unSubscription =  await this.contract.methods.endSubscriptionSubscriber(
            provider,
            utf8ToHex(endpoint))
            .send({from, gas});
        return unSubscription
    }

    /**
     * @func Provider can end subscription of a subscriber
     * @param {address} subscriber
     * @param {string} endpoint
     * @param {address} from : provider
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async endSubscriptionProvider({subscriber, endpoint, from, gas=Utils.Constants.DEFAULT_GAS}:SubscriptionEnd) :Promise<txid>{
        let unSubscription:any;
        unSubscription= await this.contract.methods.endSubscriptionProvider(
            subscriber,
            utf8ToHex(endpoint))
            .send({from, gas});
        return unSubscription;
}

    /**
     *@func  Listen to unsubscribe events , with or without filters
     * @param {Filter} filters object
     * @param {Function} callback
     */
    listenSubscriptionEnd(filters:Filter={}, callback:Function):void{
        // Specify filters and watch Incoming event
        let filter = this.contract.events
            .DataSubscriptionEnd(
                filters,
                { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' });
        filter.watch(callback);
    }

    /**
     * @func Listen to subscribe events, with or without filters
     * @param {Filter} filters
     * @param {Function} callback
     */
    listenSubscriptionStart(filters:Filter ={}, callback:Function):void{
        // Specify filters and watch Incoming event
        let filter = this.contract.events.DataPurchase(
            filters,
            { fromBlock: filters.fromBlock || 0, toBlock: 'latest' });
        filter.watch(callback);
    }


    /**
     * @func Listen to all Arbiter contract's events based on filters
     * @param {Filter} filter
     * @param {Function} callback
     */
    listen(filter:Filter = {},callback:Function) : void{
        this.contract.events.allEvents({fromBlock: filter.fromBlock|| 0, toBlock: 'latest'},callback);
    }

}
