import {BaseContract,BaseContractType} from '@zap/basecontract';
import {QueryArgs,ResponseArgs,Filter,txid} from './types'
import {Utils} from "@zap/utils";
const {toBN,utf8ToHex} = require ("web3-utils");

/**
 * Provides interface to Dispatch contract
 * @extends BaseContract
 * @param {string} artifactsDir
 * @param {number} networkId
 * @param networkProvider : Ethereum provider instance
 */
export class ZapDispatch extends BaseContract {
    constructor({artifactsDir=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"Dispatch",networkId,networkProvider});
    }

    /**
     * Subscriber query data to a provider's endpoint
     * @param {address} provider
     * @param {string} query
     * @param {string} endpoint
     * @param {Array<string>} endpointParams
     * @param {boolean} onchainProvider
     * @param {boolean} onchainSubscriber
     * @param {address} from
     * @param {BigNumber} gas
     * @returns {Promise<txid>} txid of query transaction
     */
    async queryData({provider, query, endpoint, endpointParams, onchainProvider, onchainSubscriber,from,gas=Utils.Constants.DEFAULT_GAS}:QueryArgs):Promise<txid>{
        if(endpointParams.length > 0) {
            for (let i in endpointParams) {
                endpointParams[i] = utf8ToHex(endpointParams[i]);
            }
        }
        return  await this.contract.methods.query(
            provider,
            query,
            utf8ToHex(endpoint),
            endpointParams, // endpoint-specific endpointParams
            onchainProvider,
            onchainSubscriber).send({from, gas});
    }


    /**
     * Provider responds to a query it received
     * @param {string} queryId
     * @param {Array<string>} responseParams
     * @param {boolean} dynamic number of responses string
     * @param {address} from : provider
     * @param {BigNumber} gas
     * @returns {Promise<txid>} txid of respond method
     */
    async respond({queryId, responseParams, dynamic, from,gas=Utils.Constants.DEFAULT_GAS}:ResponseArgs) :Promise<txid>{
        if (dynamic){
            return this.contract.methods.respondBytes32Array(
                queryId,
                responseParams).send({from,gas});
        }
        switch (responseParams.length) {
            case 1: {
                return this.contract.methods.respond1(
                    queryId,
                    responseParams[0]).send({ from,gas});
            }
            case 2: {
                return this.contract.methods.respond2(
                    queryId,
                    responseParams[0],
                    responseParams[1]).send({ from,gas });
            }
            case 3: {
                return this.contract.methods.respond3(
                    queryId,
                    responseParams[0],
                    responseParams[1],
                    responseParams[2]).send({ from,gas });
            }
            case 4: {
                return this.contract.methods.respond4(
                    queryId,
                    responseParams[0],
                    responseParams[1],
                    responseParams[2],
                    responseParams[3]).send({ from,gas });
            }
            default: {
                throw new Error('Invalid number of response parameters');
            }
        }
    }

    // === Events ===//

    /**
     * Listen for all events with filters
     * @param {Filter} filters
     * @param {Function} callback
     */
    listen(filters :Filter, callback:Function):void {
        this.contract.events.allEvents(
            filters,
            { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' },
            callback);
    }

    /**
     * Listen to Query Incoming events with filters
     * @param {object} filters
     * @param {Function} callback
     */
    listenIncoming(filters:object ={}, callback:Function):void{
        this.contract.events.Incoming(filters, callback);
    }

    /**
     * Listen to FUlFill Query when providers respond
     * @param {object} filters
     * @param {Function} callback
     */
    listenFulfillQuery(filters:object={}, callback:Function):void{
        this.contract.events.FulfillQuery(filters, callback);
    }

    /**
     * Listen to Offchain responses from providers
     * @param {object} filters
     * @param {Function} callback
     */
    listenOffchainResponse(filters:object={}, callback:Function):void{
        this.contract.events.OffchainResponse(filters, callback);
    }



}

export * from "./types"
