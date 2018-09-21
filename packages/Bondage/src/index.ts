import {BaseContract} from "@zapjs/basecontract";
import {BondageArgs, BondArgs, CalcBondRateType, UnbondArgs, DelegateBondArgs, NULL_ADDRESS} from "./types";
import {Filter,txid,NetworkProviderOptions,BNType} from "@zapjs/types"
const {toBN, utf8ToHex} = require("web3-utils");
const assert = require("assert");
const DEFAULT_GAS = 300000

/**
 * Provides an interface to the Bondage contract for enabling bonds and unbonds to Oracles.
 */
export class ZapBondage extends BaseContract {

    /**
     * Initializes a subclass of BaseContract that can access the methods of the Bondage contract.
     * @constructor
     * @param {NetworkProviderOptions} net. {artifactsDir ?:string|undefined,networkId?: number|undefined,networkProvider: any}
     * @param {string} net.artifactsDir - Directory where contract ABIs are located
     * @param {string} net.networkId -Select which network the contract is located on (mainnet, testnet, private)
     * @param  {Object} net.networkProvider - Ethereum network provider
     * @example new ZaBondage({networkId : 42, networkProvider : web3})
     */
    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj,{artifactName:"Bondage"}));
    }

    /**
     * @function
     * Bonds a given number of dots from a subscriber to a provider's endpoint.
     * Note: this requires that at least zapNum has been approved from the subscriber to be transferred by the Bondage contract.
     * @param  {BondArgs} bond. {provider,endpoint,dots,from,gas?=DEFAULT_GAS}
     * @param {string} bond.provider - Provider's address
     * @param {number} bond.dots Number of dots to bond to this provider
     * @param {address} bond.from - Subscriber's owner (0 broker)  or broker's address
     * @param {number} bond.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash.
     */
    public async bond({provider, endpoint, dots, from, gas= DEFAULT_GAS}: BondArgs): Promise<txid> {
        assert(dots && dots > 0, "Dots to bond must be greater than 0.");
        const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
        if(broker != NULL_ADDRESS){
            if(from!==broker){
                throw new Error(`Broker address ${broker} needs to call delegate bonding`);
            }
        }
        return await this.contract.methods.bond(
            provider,
            utf8ToHex(endpoint),
            toBN(dots).toString())
            .send({from, gas});

    }

     /**
     * Bonds a given number of dots from an account to a subscriber. This would be used to bond to a provider on behalf of another account, such as a smart contract.
      * @param {DelegateBondArgs} delegate. {provider, endpoint, dots, subscriber, from, gas= DEFAULT_GAS}
     * @param {string} delegate.provider - Provider's address
     * @param {string} delegate.endpoint - Data endpoint of the provider
     * @param {number} delegate.dots - Number of dots to bond to this provider
     * @param {address} delegate.subscriber - Address of the intended holder of the dots (subscriber)
     * @param {address} delegate.from - Address of the data subscriber
     * @param {number} [delegate.gas] - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    public async delegateBond({provider, endpoint, dots, subscriber, from, gas= DEFAULT_GAS}: DelegateBondArgs): Promise<txid> {
        assert(dots && dots > 0, "Dots to bond must be greater than 0.");
         const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
         if(broker != NULL_ADDRESS){
             if(from!==broker){
                 throw new Error(`Broker address ${broker} needs to call delegate bonding for this endpoint`);
             }
         }
        return await this.contract.methods.delegateBond(
            subscriber,
            provider,
            utf8ToHex(endpoint),
            toBN(dots).toString())
            .send({from, gas});
    }


    /**
     * Unbonds a given number of dots from a provider's endpoint and transfers the appropriate amount of Zap to the subscriber.
     * @param {UnbondArgs} unbond. {provider, endpoint, dots, from, gas= DEFAULT_GAS}
     * @param {address} unbond.provider - Address of the data provider
     * @param {string} unbond.endpoint - Data endpoint of the provider
     * @param {number} unbond.dots - The number of dots to unbond from the contract
     * @param {address} unbond.from  - Address of the data subscriber
     * @param {number} unbond.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    public async unbond({provider, endpoint, dots, from, gas= DEFAULT_GAS}: UnbondArgs): Promise<txid> {
        assert(dots && dots>0,"Dots to unbond must be greater than 0");
        const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
        if(broker != NULL_ADDRESS){
            if(from!==broker){
                throw `Broker address ${broker} needs to call unbonding for this endpoint`;
            }
        }
        return await this.contract.methods.unbond(
            provider,
            utf8ToHex(endpoint),
            toBN(dots).toString())
            .send({from, gas});
    }

    /**
     * Gets the number of dots that are bounded to a provider's endpoint for the current subscriber.
     * @param {BondageArgs} bond. {subscriber, provider, endpoint}
     * @param {address} bond.subscriber - Address of the data subscriber
     * @param {address} bond.provider  - Address of the data provider
     * @param {string} bond.endpoint - Data endpoint of the provider
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into the number of bound dots to this provider's endpoint
     */
    public async getBoundDots({subscriber, provider, endpoint}: BondageArgs): Promise<string|BNType> {
        return await this.contract.methods.getBoundDots(
            subscriber,
            provider,
            utf8ToHex(endpoint)
        ).call();
    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {BondageArgs} bondage. {provider, endpoint, dots}
     * @param {address} bondage.provider - Address of the data provider
     * @param {string} bondage.endpoint - Endpoint to calculate zap
     * @param {number} bondage.dots - Number of dots to calculate the price (in Zap) for
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into the price (in Zap) for the given number of dots
     */
    public async calcZapForDots({provider, endpoint, dots}: BondageArgs): Promise<string|BNType> {
        return await this.contract.methods.calcZapForDots(
            provider,
            utf8ToHex(endpoint),
            toBN(dots).toString()).call();
    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {BondageArgs} bondage. {provider, endpoint, dots}
     * @param {address} bondage.provider - Address of the data provider
     * @param {string} bondage.endpoint -Data endpoint of the provider
     * @param {number} bondage.dots - dots that subscriber want to use
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into a price (in Zap wei)
     */
    public async currentCostOfDot({provider, endpoint, dots}: BondageArgs): Promise<string|BNType> {
        return this.contract.methods.currentCostOfDot(
            provider,
            utf8ToHex(endpoint),
            toBN(dots).toString()
        ).call();
    }

    /**
     * Get Maximum dots that can be bound for an endpoint of a provider
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {string} b.provider - Provider's address
     * @param {string} b.endpoint - Provider's endpoint to get dots limit
     */
    public  async getDotsLimit({provider,endpoint}:BondageArgs):Promise<string|BNType>{
        return await this.contract.methods.dotLimit(provider,utf8ToHex(endpoint)).call().valueOf()
    }

    /**
     * Gets the total number of dots that have been issued by a provider's endpoint.
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {address} b.provider - Address of the data provider
     * @param {string} b.endpoint - Data endpoint of the provider
     * @returns {Promise<string|BigNumber>} Returns a Promise that will eventually resolve into an number of dots
     */
    public async getDotsIssued({provider, endpoint}: BondageArgs): Promise<string> {
        return await this.contract.methods.getDotsIssued(
            provider,
            utf8ToHex(endpoint)
        ).call();
    }


    /**
     * Get Broker address for this provider's endpoint, return NULL_ADDRESS if there is none
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {string} b.provider - Provider's Address
     * @param {string} b.endpoint - Provider's endpoint to get Broker's address
     */
    public async getBrokerAddress({provider,endpoint}:BondageArgs):Promise<string>{
        return  await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call();
    }
    /**
     * Gets the total amount of Zap that has been bonded to a provider's endpoint.
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {address} b.provider - Address of the data provider
     * @param {string} b.endpoint  - Data endpoint of the provider
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer amount of Zap (wei)
     */
    public async getZapBound({provider, endpoint}: BondageArgs ): Promise<string|BNType> {
        return await this.contract.methods.getZapBound(
            provider,
            utf8ToHex(endpoint)
        ).call();
    }

    /**
     * Listen for all Bondage contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {?Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    public listen(filters: Filter = {}, callback: Function): void {
        this.contract.events.allEvents(filters, {fromBlock: 0, toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Bound" Bondage contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {?Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    public listenBound(filters: Filter = {}, callback: Function): void {
        this.contract.events.Bound(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Unbond" Bondage contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    public listenUnbound(filters: Filter = {} , callback: Function): void {
        this.contract.events.Unbond(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Escrow" Bondage contract events based on an optional filter, , executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    public listenEscrowed(filters: Filter = {}, callback: Function): void {
        this.contract.events.Escrowed(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Released" Bondage contract events based on an optional filter, executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    public listenReleased(filters: Filter = {}, callback: Function): void {
        this.contract.events.Released(filters, {toBlock: "latest"}, callback);
    }

}

export * from "./types";
