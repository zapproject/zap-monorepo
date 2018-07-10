import {BaseContract,BaseContractType} from '@zap/basecontract';
import {QueryArgs,ResponseArgs,FilterType} from './types'
import {DEFAULT_GAS} from "@zap/utils";
const {toBN,utf8ToHex} = require ("web3-utils");
export class ZapDispatch extends BaseContract {

    constructor({artifactsDir=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"Dispatch",networkId,networkProvider});
    }

    async queryData({provider, query, endpoint, params, onchainProvider, onchainSubscriber,from,gas=DEFAULT_GAS}:QueryArgs){
        if(params.length>0) {
            for (let i in params) {
                params[i] = utf8ToHex(params[i]);
            }
        }
        let resultQuery = await this.contract.methods.query(
            provider,
            query,
            utf8ToHex(endpoint),
            params, // endpoint-specific params
            onchainProvider,
            onchainSubscriber).send({from, gas});
        return resultQuery;
    }


    async respond({queryId, responseParams, dynamic, from,gas=DEFAULT_GAS}:ResponseArgs) {
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
     * Listen for oracle queries
     *
     * @param filters event filters
     * @param callback callback function that will be called after event received
     */
    listen(filters :FilterType, callback:Function) {
        this.contract.events.allEvents(
            filters,
            { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' },
            callback);
    }
    listenIncoming(filters:object ={}, callback:Function){
        this.contract.events.Incoming(filters, callback);
    }

    listenFulfillQuery(filters:object={}, callback:Function){
        this.contract.events.FulfillQuery(filters, callback);
    }

    listenOffchainResponse(filters:object={}, callback:Function){
        this.contract.events.OffchainResponse(filters, callback);
    }



}

export * from "./types"
