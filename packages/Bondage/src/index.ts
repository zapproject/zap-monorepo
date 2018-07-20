import {BaseContract, ContractType} from "@zap/basecontract";
import {Utils} from "@zap/utils";
import {BondageArgs, BondArgs, CalcBondRateType, Filter, txid, UnbondArgs} from "./types";
const {toBN, utf8ToHex, toHex} = require("web3-utils");
const assert = require("assert");

/**
 * Provides an interface to the Bondage contract for enabling bonds and unbonds to Oracles.
 * @extends BaseContract
 * @param {any} artifactsDir Directory where contract ABIs are located
 * @param {any} artifactName The name of the artifact file (Bondage)
 * @param {any} networkId Select which network the contract is located on (mainnet, testnet, private)
 * @param {any} networkProvider Ethereum network provider (e.g. Infura)
 */
export class ZapBondage extends BaseContract {

    /**
     * Initializes a subclass of BaseContract that can access the methods of the Bondage contract.
     * @constructor
     * @augments BaseContract
     * @param {string} artifactsDir Directory where contract ABIs are located
     * @param {string} networkId Select which network the contract is located on (mainnet, testnet, private)
     * @param  networkProvider Ethereum network provider (e.g. Infura)
     */
    constructor(obj ?: ContractType){
        super(Object.assign(obj,{artifactName:"Bondage"}));
    }

    /**
     * Bonds a given amount of Zap from a subscriber to a provider's endpoint. Note: this requires that at least zapNum has been approved from the subscriber to be transferred by the Bondage contract.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} zapNum Number of zap to bond to this provider (Units: 1 wei Zap = 10^-18 Zap)
     * @param {address} from Address of the data subscriber
     * @param {number} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    public async bond({provider, endpoint, zapNum, from, gas= Utils.Constants.DEFAULT_GAS}: BondArgs): Promise<txid> {
        console.log("args : ", provider, endpoint, zapNum, from);
        assert(zapNum && zapNum > 0, "Zap to bond must be greater than 0.");
        return await this.contract.methods.bond(
            provider,
            utf8ToHex(endpoint),
            toBN(zapNum))
            .send({from, gas});

    }

    /**
     * Unbonds a given number of dots from a provider's endpoint and transfers the appropriate amount of Zap to the subscriber.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} dots The number of dots to unbond from the contract
     * @param {address} from Address of the data subscriber
     * @param {number} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    public async unbond({provider, endpoint, dots, from, gas= Utils.Constants.DEFAULT_GAS}: UnbondArgs): Promise<txid> {
        assert(dots && dots>0,"Dots to unbond must be greater than 0");
        return await this.contract.methods.unbond(
            provider,
            utf8ToHex(endpoint),
            toBN(dots))
            .send({from, gas});
    }

    /**
     * Gets the number of dots that are bounded to a provider's endpoint for the current subscriber.
     * @param {address} subscriber Address of the data subscriber
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into the number of bound dots to this provider's endpoint
     */
    public async getBoundDots({subscriber, provider, endpoint}: BondageArgs): Promise<number> {
        const boundDots =  await this.contract.methods.getBoundDots(
            subscriber,
            provider,
            utf8ToHex(endpoint)
        ).call();
        return parseInt(boundDots);
    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} dots Number of dots to calculate the price (in Zap) for
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into the price (in Zap) for the given number of dots
     */
    public async calcZapForDots({provider, endpoint, dots}: BondageArgs): Promise<number> {
        const zapRequired =  await this.contract.methods.calcZapForDots(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)).call();
        return parseInt(zapRequired);
    }

    /**
     * Calculates the number of dots that can be bonded from a given amount of Zap to a provider's endpoint.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} zapNum Amount of Zap to compute the bond rate for
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into the number of dots the given amount of Zap can buy
     */
    public async calcBondRate({provider, endpoint, zapNum}: CalcBondRateType): Promise<number> {
        const bondRate =  await this.contract.methods.calcBondRate(
            provider,
            utf8ToHex(endpoint),
            zapNum
        ).call();
        return parseInt(bondRate["1"]);

    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} dots : dots that subscriber want to use
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into a price (in Zap wei)
     */
    public async currentCostOfDot({provider, endpoint, dots}: BondageArgs): Promise<number> {
        return this.contract.methods.currentCostOfDot(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)
        ).call();
    }

    /**
     * Gets the total number of dots that have been issued by a provider's endpoint.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer number of dots
     */
    public async getDotsIssued({provider, endpoint}: BondageArgs): Promise<number> {
        const issuedDots = await  this.contract.methods.getDotsIssued(
            provider,
            utf8ToHex(endpoint)
        ).call();
        return parseInt(issuedDots);
    }

    /**
     * Gets the total amount of Zap that has been bonded to a provider's endpoint.
     * @function
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into an integer amount of Zap (wei)
     */
    public async getZapBound({provider, endpoint}: BondageArgs ): Promise<number> {
        const zapBound =  this.contract.methods.getZapBound(
            provider,
            utf8ToHex(endpoint)
        ).call();
        return parseFloat(zapBound);
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
