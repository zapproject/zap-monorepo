import  {BaseContract,BaseContractTypes} from '@zap/basecontract';
import {SubscriptionInit,SubscriptionEnd,Filter} from "./types"
import {toBN,utf8ToHex} from 'web3-utils';
import {DEFAULT_GAS} from "@zap/utils"
class ZapArbiter extends BaseContract {

    constructor({artifactsDir, networkId,networkProvider}:BaseContractTypes){
        super({artifactsDir,artifactName:'Arbiter',networkId,networkProvider});
    }

    async initiateSubscription(
        {provider, endpoint, endpointParams, blocks, publicKey, from, gas=DEFAULT_GAS} : SubscriptionInit) {
        try {
            for (let i in endpointParams){
                endpointParams[i] = utf8ToHex(endpointParams[i]);
            }

            return await this.contract.methods.initiateSubscription(
                provider,
                utf8ToHex(endpoint),
                endpointParams,
                toBN(publicKey),
                toBN(blocks)).send({from, gas});
        } catch (err) {
            throw err;
        }
    }

    async endSubscription({provider, endpoint, from, gas=DEFAULT_GAS}:SubscriptionEnd) {
        try {
            return await this.contract.methods.endSubscriptionSubscriber(
                provider,
                utf8ToHex(endpoint))
                .send({from, gas});
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
export default ZapArbiter;
