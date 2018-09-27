import {BaseContract} from '@zapjs/basecontract';
import {QueryArgs,ResponseArgs} from './types'
import {NetworkProviderOptions, txid,Filter,DEFAULT_GAS} from "@zapjs/types"
const {utf8ToHex, toBN} = require ("web3-utils");
/**
 * Provides an interface to the Dispatch contract for enabling data queries and responses.
 */
export class ZapDispatch extends BaseContract {
    /**
     * @constructor
     * @param {NetworkProviderOptions} net. {artifactsDir ?:string|undefined,networkId?: number|undefined,networkProvider: any}
     * @param {string} net.artifactsDir - Directory where contract ABIs are located
     * @param {string} net.networkId -Select which network the contract is located on (mainnet, testnet, private)
     * @param  {Object} net.networkProvider - Ethereum network provider
     * @example new ZapDispatch({networkId : 42, networkProvider : web3})
     */
    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj, {artifactName:"DISPATCH"}));
    }

   /**
     * Queries data from a subscriber to a given provider's endpoint, passing in a query string and endpoint parameters that will be processed by the oracle.
     * @param {QueryArgs} q.  {provider, query, endpoint, endpointParams,from,gas=DEFAULT_GAS}
     * @param {address} q.provider - Address of the data provider
     * @param {string} q.query - Subscriber given query string to be handled by provider
     * @param {string} q.endpoint - Data endpoint of provider, meant to determine how query is handled
     * @param {Array<string>} q.endpointParams - Parameters passed to data provider's endpoint
     * @param {address} q.from - Address of the subscriber
     * @param {BigNumber} q.gas - Set the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async queryData({provider, query, endpoint, endpointParams,from,gas=DEFAULT_GAS}:QueryArgs):Promise<txid>{
        if(endpointParams.length > 0) {
            for (let i in endpointParams) {
                if (!endpointParams[i].startsWith('0x')) {
                    endpointParams[i] = utf8ToHex(endpointParams[i]);
                }
            }
        }
      
        return  await this.contract.methods.query(
            provider,
            query,
            utf8ToHex(endpoint),
            endpointParams
        ).send({from, gas});
    }


    /**
     * Provider responds to a query it received
     * @param {ResponseArgs} r. {queryId, responseParams, dynamic, from,gas=DEFAULT_GAS}:ResponseArgs)
     * @param {string} r.queryId - A unique identifier for the query
     * @param {Array<string | number>} r.responseParams - List of responses returned by provider. Length determines which dispatch response is called
     * @param {boolean} r.dynamic - Determines if the IntArray/Bytes32Array dispatch response should be used
     * @param {address} r.from  - Address of the provider calling the respond function
     * @param {BigNumber} r.gas - Set the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async respond({queryId, responseParams, dynamic, from,gas=DEFAULT_GAS}:ResponseArgs) :Promise<txid>{
        if (dynamic){
            if(typeof responseParams[0] === "number"){
                const bignums = responseParams.map(x => Number(x).toLocaleString('fullwide', { useGrouping: false }));
                return this.contract.methods.respondIntArray(queryId, bignums).send({from,gas});
            }
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
     * Listen for all Dispatch contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    listen(filters :Filter, callback:Function):void {
        this.contract.events.allEvents(
            filters,
            { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' },
            callback);
    }

    /**
     * Listen for "Incoming" Dispatch contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {object} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    listenIncoming(filters:object ={}, callback:Function):void{
        this.contract.events.Incoming(filters, callback);
    }

    /**
     * Listen for "FulfillQuery" Dispatch contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {object} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    listenFulfillQuery(filters:object={}, callback:Function):void{
        this.contract.events.FulfillQuery(filters, callback);
    }

    /**
     * Listen for all Offchain responses Dispatch contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {object} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    listenOffchainResponse(filters:object={}, callback:Function):void{
        this.contract.events.OffchainResponse(filters, callback);
        this.contract.events.OffchainResponseInt(filters, callback);
        this.contract.events.OffchainResult1(filters, callback);
        this.contract.events.OffchainResult2(filters, callback);
        this.contract.events.OffchainResult3(filters, callback);
        this.contract.events.OffchainResult4(filters, callback);

    }

}

export * from "./types"
