import  {BaseContract,BaseContractTypes} from '@zap/basecontract';
import {SubscriptionInit,SubscriptionEnd,Filter} from "./types"
import {toBN,utf8ToHex} from 'web3-utils';
class ZapArbiter extends BaseContract {

    constructor({artifactsDir, networkId,networkProvider}:BaseContractTypes){
        super({artifactsDir,artifactName:'Arbiter',networkId,networkProvider});
    }

    async initiateSubscription(
        {provider, endpoint, endpointParams, blocks, publicKey, from, gas} : SubscriptionInit) {
        try {
            for (let i in endpointParams){
                endpointParams[i] = this.web3.utils.utf8ToHex(endpointParams[i]);
            }

            return await this.contract.methods.initiateSubscription(
                provider,
                this.web3.utils.utf8ToHex(endpoint),
                endpointParams,
                this.web3.utils.toBN(publicKey),
                this.web3.utils.toBN(blocks)).send({from: from, gas: gas});
        } catch (err) {
            throw err;
        }
    }

    async endSubscription({provider, endpoint, from, gas}:SubscriptionEnd) {
        try {
            return await this.contract.methods.endSubscriptionSubscriber(
                provider,
                this.web3.utils.utf8ToHex(endpoint))
                .send({from: from, gas: gas});
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