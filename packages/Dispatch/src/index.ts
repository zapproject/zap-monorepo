const basecontract = require('basecontract');
const Artifacts = require("artifacts");
import {QueryArgs,ResponseArgs} from './types'
class ZapDispatch extends basecontract {

    constructor({networkId=null,networkProvider=null}={}){
        super({contract:"Dispatch",networkId,networkProvider});
    }

    async queryData({provider, query, endpoint, params, onchainProvider, onchainSubscriber}:QueryArgs){
        let resultQuery = await this.contract.methods.query(
            provider,
            query,
            this.web3.utils.utf8ToHex(endpoint),
            params, // endpoint-specific params
            onchainProvider,
            onchainSubscriber).send({from: this.owner, gas: 6000000});
        return resultQuery;
    }


    async respond({queryId, responseParams, dynamic, from}:ResponseArgs) {
        if (dynamic){
            return this.contract.methods.respondBytes32Array(
                queryId,
                responseParams).send({from: from});
        }
        switch (responseParams.length) {
            case 1: {
                return this.contract.methods.respond1(
                    queryId,
                    responseParams[0]).send({ from: from });
            }
            case 2: {
                return this.contract.methods.respond2(
                    queryId,
                    responseParams[0],
                    responseParams[1]).send({ from: from });
            }
            case 3: {
                return this.contract.methods.respond3(
                    queryId,
                    responseParams[0],
                    responseParams[1],
                    responseParams[2]).send({ from: from });
            }
            case 4: {
                return this.contract.methods.respond4(
                    queryId,
                    responseParams[0],
                    responseParams[1],
                    responseParams[2],
                    responseParams[3]).send({ from: from });
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
    listen(filters :object ={}, callback:Function) {
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

module.exports = {
  ZapDispatch,
  DispatchTypes :"./types"
}
