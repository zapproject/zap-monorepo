import {BaseContract} from '@zapjs/basecontract';
import {cancelQuery, QueryArgs, ResponseArgs,
    NetworkProviderOptions, txid,Filter,DEFAULT_GAS,address,BNType,OffchainResponse,NumType} from "@zapjs/types"
const {utf8ToHex,hexToUtf8} = require ("web3-utils");
/**
 * Provides an interface to the Dispatch contract for enabling data queries and responses.
 */
export class ZapDispatch extends BaseContract {
    /**
     * @constructor
     * @param {NetworkProviderOptions} net. {artifactsDir ?:string|undefined,networkId?: number , default = 1 ,networkProvider: web3}
     * @param {string} net.artifactsDir - Directory where contract ABIs are located
     * @param {string} net.networkId -Select which network the contract is located on (mainnet, testnet, private)
     * @param  {Object} net.networkProvider - Ethereum network provider
     * @example new ZapDispatch({networkId : 42, networkProvider : web3})
     */
    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj, {artifactName:"DISPATCH"}));
    }

    /******************* QUERY FUNCTIONS ****************************/

   /**
     * Queries data from a subscriber to a given provider's endpoint, passing in a query string and endpoint parameters that will be processed by the oracle.
     * @param {QueryArgs} q.  {provider, query, endpoint, endpointParams,from,gas=DEFAULT_GAS}
     * @param {address} q.provider - Address of the data provider
     * @param {string} q.query - Subscriber given query string to be handled by provider
     * @param {string} q.endpoint - Data endpoint of provider, meant to determine how query is handled
     * @param {Array<string>} q.endpointParams - Parameters passed to data provider's endpoint
     * @param {address} q.from - Address of the subscriber
     * @param {BigNumber} q.gas - Set the gas limit for this transaction (optional)
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Transaction hash
     */
    async queryData({provider, query, endpoint, endpointParams,from,gasPrice, gas=DEFAULT_GAS}:QueryArgs, cb?: Function):Promise<txid>{
        if(endpointParams.length > 0) {
            for (let i in endpointParams) {
                if (!endpointParams[i].startsWith('0x')) {
                    endpointParams[i] = utf8ToHex(endpointParams[i]);
                }
            }
        }
        const promiEvent = this.contract.methods.query(
            provider,
            query,
            utf8ToHex(endpoint),
            endpointParams
        ).send({from, gas,gasPrice});

        if (cb) {
            promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
            promiEvent.on('error', (error: any) => cb(error));
        }
            
        return promiEvent;
    }

    /**
     * Cancel a queryId
     * @param queryId : string|number
     * @param from : subscriber address that submitted the query
     * @param gas (optional)
     * @returns {Promise<number|string>} block number that query was successfully canceled. or 0 if failed
     */
    async cancelQuery({queryId,from, gasPrice, gas=DEFAULT_GAS}:cancelQuery): Promise<number|string>{
        try {
            await this.contract.methods.cancelQuery(queryId).send({from: from, gas, gasPrice});
        }catch(e){
            return 0;
        }
        return await this.contract.methods.getCancel(queryId).call()
    }

    /**
     * Provider responds to a query it received
     * @param {ResponseArgs} r. {queryId, responseParams, dynamic, from,gas=DEFAULT_GAS}:ResponseArgs)
     * @param {string} r.queryId - A unique identifier for the query
     * @param {Array<string | number>} r.responseParams - List of responses returned by provider. Length determines which dispatch response is called
     * @param {boolean} r.dynamic - Determines if the IntArray/Bytes32Array dispatch response should be used
     * @param {address} r.from  - Address of the provider calling the respond function
     * @param {BigNumber} r.gas - Set the gas limit for this transaction (optional)
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Transaction hash
     */
    async respond({queryId, responseParams, dynamic, from,gasPrice, gas=DEFAULT_GAS}:ResponseArgs) :Promise<txid>{
        if (dynamic){
            if(typeof responseParams[0] === "number"){
                const bignums = responseParams.map(x => Number(x).toLocaleString('fullwide', { useGrouping: false }));
                return this.contract.methods.respondIntArray(queryId, bignums).send({from,gas,gasPrice});
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

    /*********** GETTERS *******************/

    /**
     * Get Provider of this query id
     * @param queryId
     * @returns promise<address> Provider's address
     */
    async getQueryIdProvider({queryId}:{queryId:NumType}): Promise<address>{
        return await this.contract.methods.getProvider(queryId).call();
    }

    /**
     * Get Subscriber's address that submitted the query
     * @param queryId
     * @returns address
     */
    async getSubscriber({queryId}:{queryId:NumType}) : Promise<address>{
        return await this.contract.methods.getSubscriber(queryId).call();
    }

    /**
     * Get Endpoint of the query
     * @param queryId
     * @returns Endpoint string
     */
    async getEndpoint({queryId}:{queryId:NumType}):Promise<string>{
        let endpoint = await this.contract.methods.getEndpoint(queryId).call();
        return hexToUtf8(endpoint);
    }

    /**
     * Get status of query Id
     * @param queryId
     * @returns status of query Id
     */
    async getStatus({queryId}:{queryId:NumType}):Promise<number|string>{
        return await this.contract.methods.getStatus(queryId).call();
    }

    /**
     * Get status if a queryId is canceled
     * @param queryId
     * @returns cancel status of query Id
     */
    async getCancel({queryId}:{queryId:NumType}):Promise<string|number>{
        return await this.contract.methods.getCancel(queryId).call();
    }

    /**
     * Get User of this query
     * @param queryId
     * @returns User
     */
    async getUserQuery({queryId}:{queryId:NumType}):Promise<string>{
        return await this.contract.methods.getUserQuery(queryId).call();
    }

    /**
     * Get information about onchain or offchain subscriber of this queryId
     * @param queryId
     * @returns boolean onchain
     */
    async getSubscriberOnchain({queryId}:{queryId:NumType}):Promise<boolean>{
        return await this.contract.methods.getSubscriberOnchain(queryId).call()
    }


    /***************** EVENTS *****************/

    /**
     * Listen for all Dispatch contract events based on an optional filter,
     * executing a callback function when it matches the filter.
     * @param {Filter} filters :{}
     * @param {Function} callback function for events
     */
    listen(filters :Filter={}, callback:Function):void {
        this.contract.events.allEvents(
            filters,
            { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' },
            callback);
    }

    /**
     * Listen for "Incoming" Dispatch contract events based on
     * an optional filter, executing a callback function when it matches the filter.
     * @param {object} filters {subscriber:address, provider:address,
     * id:number|string,query:string, endpoint:bytes32, endpointParams:bytes32[], onchainSubscriber:boolean}
     * @param {Function} callback
     */
    listenIncoming(filters:Filter ={}, callback:Function):void{
        this.contract.events.Incoming(filters, callback);
    }

    /**
     * Listen for "FulfillQuery" Dispatch contract events based on an optional filter
     * @param {object} filters {subscriber:address, provider:address, endpoint:bytes32}
     * @param {Function} callback function
     */
    listenFulfillQuery(filters:Filter={}, callback:Function):void{
        this.contract.events.FulfillQuery(filters, callback);
    }

    /**
     * Listen for all Offchain responses Dispatch contract events based on an optional filter
     * @param {object} filters {id: number|string,subscriber:address, provider: address , response: bytes32[]|int[],
     *  response1:string, response2:string, response3:string, response4:string}
     * @param {Function} callback
     */
    listenOffchainResponse(filters:OffchainResponse={}, callback:Function):void{
        this.contract.events.OffchainResponse(filters, callback);
        this.contract.events.OffchainResponseInt(filters, callback);
        this.contract.events.OffchainResult1(filters, callback);
        this.contract.events.OffchainResult2(filters, callback);
        this.contract.events.OffchainResult3(filters, callback);
        this.contract.events.OffchainResult4(filters, callback);

    }

    /**
     * Lsiten to Cancel query events
     * @param filters
     * @param callback
     */
    listenCancelRequest(filters:Filter={},callback:Function):void{
        this.contract.events.CancelRequest(filters,callback);
    }

}
