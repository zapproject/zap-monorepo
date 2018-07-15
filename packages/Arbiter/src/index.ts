import  {BaseContract,BaseContractType} from '@zap/basecontract';
import {SubscriptionInit,SubscriptionEnd,Filter,SubscriptionType} from "./types"
const {toBN,utf8ToHex} = require ('web3-utils');
import {DEFAULT_GAS} from "@zap/utils"
export class ZapArbiter extends BaseContract {

    constructor({artifactsDir, networkId,networkProvider}:BaseContractType){
        super({artifactsDir,artifactName:'Arbiter',networkId,networkProvider});
    }


    async initiateSubscription(
        {provider, endpoint, endpoint_params, blocks, pubkey, from, gas=DEFAULT_GAS} : SubscriptionInit) {
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

    async getSubscription({provider,subscriber,endpoint}:SubscriptionType){
        let subscription = await this.contract.methods.getSubscription(provider,subscriber,utf8ToHex(endpoint)).call();
        console.log("subscription result : ",subscription)
         return subscription

    }

    async endSubscriptionSubscriber({provider, endpoint, from, gas=DEFAULT_GAS}:SubscriptionEnd) {
        let unSubscription:any
        try {
            unSubscription =  await this.contract.methods.endSubscriptionSubscriber(
                provider,
                utf8ToHex(endpoint))
                .send({from, gas});
            return unSubscription
        } catch (err) {
            throw err;
        }
    }

    async endSubscriptionProvider({subscriber, endpoint, from, gas=DEFAULT_GAS}:SubscriptionEnd) {
        let unSubscription:any;
        try {
            unSubscription= await this.contract.methods.endSubscriptionProvider(
                subscriber,
                utf8ToHex(endpoint))
                .send({from, gas});
            return unSubscription;
        } catch (err) {
            throw err;
        }
    }

    /**
     *
     * @param filters
     * @param callback
     */
    listenSubscriptionEnd(filters:Filter={}, callback:Function){
        try {
            // Specify filters and watch Incoming event
            let filter = this.contract.events
                .DataSubscriptionEnd(
                    filters,
                    { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' });
            filter.watch(callback);
        } catch (err) {
            throw err;
        }
    }

    /**
     *
     * @param filters
     * @param callback
     */
    listenSubscriptionStart(filters:Filter ={}, callback:Function){
        try {
            // Specify filters and watch Incoming event
            let filter = this.contract.events.DataPurchase(
                filters,
                { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' });
            filter.watch(callback);
        } catch (err) {
            throw err;
        }
    }


    /**
     * Listen to all events
     * @param callback
     */
    listen(callback:Function){
        this.contract.events.allEvents({fromBlock: 0, toBlock: 'latest'},callback);
    }

}
