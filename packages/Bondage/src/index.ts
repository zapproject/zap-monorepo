import {BaseContract,BaseContractType} from '@zap/basecontract'
import {BondArgs,UnbondArgs,BondageArgs, CalcBondRateType,txid,Filter} from "./types";
import {Utils} from '@zap/utils';
const {toBN, utf8ToHex,toHex} = require("web3-utils");
const assert = require("assert");

/**
 * Manage bondage activities
 * @extends BaseContract
 * @param {any} artifactsDir
 * @param {any} artifactName
 * @param {any} networkId
 * @param {any} networkProvider
 */
export class ZapBondage extends BaseContract {

    constructor({artifactsDir=undefined,artifactName=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"Bondage",networkId,networkProvider});
    }

    /**
     * Bond number of Zap Token from a subscriber to a provider's endpoint,
     * this requires approved Zap Token from subscriber to Bondage contract
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} zapNum :  number of Zap Token to bond
     * @param {address} from : subscriber
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async bond({provider, endpoint, zapNum, from, gas=Utils.Constants.DEFAULT_GAS}:BondArgs): Promise<txid> {
        console.log("args : ", provider, endpoint, zapNum, from)
        assert(zapNum && zapNum>0,"Zap to Bond must be greater than 0");
        return await this.contract.methods.bond(
            provider,
            utf8ToHex(endpoint),
            toBN(zapNum))
            .send({from,gas});

    }


    /**
     * Unbond number of dots from a subscriber to a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} dots
     * @param {address} from: subscriber
     * @param {number} gas
     * @returns {Promise<txid>}
     */
    async unbond({provider, endpoint, dots, from, gas=Utils.Constants.DEFAULT_GAS}:UnbondArgs):Promise<txid> {
        return await this.contract.methods.unbond(
            provider,
            utf8ToHex(endpoint),
            toBN(dots))
            .send({from,gas});
    }

    /**
     * Get number of dots that are bounded to a provider's endpoint for a subscriber
     * @param {address} subscriber
     * @param {address} provider
     * @param {string} endpoint
     * @returns {Promise<number>} : number of bound dots
     */
    async getBoundDots({subscriber, provider, endpoint}:BondageArgs): Promise<number> {
        let boundDots=  await this.contract.methods.getBoundDots(
            subscriber,
            provider,
            utf8ToHex(endpoint),
        ).call();
        return parseInt(boundDots);
    }

    /**
     * Calculate Zap required to bond number of dots to a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} dots : number of dots that subscriber wants to use
     * @returns {Promise<number>} : number of Zap required to bond to use inquired dots
     */
    async calcZapForDots({provider, endpoint, dots}:BondageArgs):Promise<number>{
        let zapRequired =  await this.contract.methods.calcZapForDots(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)).call();
        return parseInt(zapRequired);
    }

    /**
     * Calculate Bond's rate for a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} inquired zapNum to see how many dots can subscriber get
     * @returns {Promise<number>} :  number of dots that can be used with inquired Zap Tokens
     */
    async calcBondRate({provider, endpoint, zapNum}:CalcBondRateType):Promise<number>{
        let bondRate =  await this.contract.methods.calcBondRate(
            provider,
            utf8ToHex(endpoint),
            zapNum
        ).call();
        return parseInt(bondRate['1'])

    }

    /**
     * Get Zap Token cost of next inquired dots
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} dots : dots that subscriber want to use
     * @returns {Promise<number>} : Price of inquired dots
     */
    async currentCostOfDot({provider, endpoint, dots}:BondageArgs) : Promise<number>{
        return this.contract.methods.currentCostOfDot(
            provider,
            utf8ToHex(endpoint),
            toBN(dots)
        ).call();
    }

    /**
     * Get the amount of dots that have been issued for a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @returns {Promise<number>} : number of issued dots
     */
    async getDotsIssued({provider, endpoint}:BondageArgs):Promise<number>{
        let issuedDots = await  this.contract.methods.getDotsIssued(
            provider,
            utf8ToHex(endpoint)
        ).call();
        return parseInt(issuedDots)
    }

    /**
     * Get amount of Zap tokens that are bound to a provider's endpoint
     * @function
     * @param {address} provider
     * @param {string} endpoint
     * @returns {Promise<number>} number of bound Zap tokens
     */
    async getZapBound({provider, endpoint} :BondageArgs ) :Promise<number>{
        let zapBound =  this.contract.methods.getZapBound(
            provider,
            utf8ToHex(endpoint)
        ).call();
        return parseFloat(zapBound)
    }

    /**
     * Listen to all Bondage contract's events with optional filters
     * @param {?Filter} filters
     * @param {Function} callback
     */
    listen(filters:Filter = {}, callback:Function):void{
        this.contract.events.allEvents(filters, {fromBlock: 0, toBlock: 'latest'}, callback);
    }

    /**
     * Listen to Bonding events
     * @param {?Filter} filters
     * @param {Function} callback
     */
    listenBound(filters :Filter = {}, callback :Function):void{
        this.contract.events.Bound(filters, {toBlock: 'latest'}, callback);
    }

    /**
     * Listen to Unbonding events
     * @param {Filter} filters
     * @param {Function} callback
     */
    listenUnbound(filters:Filter = {} , callback :Function):void{
        this.contract.events.Unbond(filters, {toBlock: 'latest'}, callback);
    }

    /**
     * Listen to Escrow events
     * @param {Filter} filters
     * @param {Function} callback
     */
    listenEscrowed(filters :Filter = {}, callback:Function):void{
        this.contract.events.Escrowed(filters, {toBlock: 'latest'}, callback);
    }

    /**
     * Listen to Release Bound Zap Tokens events
     * @param {Filter} filters
     * @param {Function} callback
     */
    listenReleased(filters :Filter = {}, callback :Function):void{
        this.contract.events.Released(filters, {toBlock: 'latest'}, callback);
    }

}

export * from "./types"
