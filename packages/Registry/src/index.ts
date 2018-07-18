const {toHex,utf8ToHex,toBN, hexToUtf8} = require("web3-utils");
import {BaseContract,BaseContractType} from "@zap/basecontract";
import {Curve,CurveType} from "@zap/curve";
import {Utils} from "@zap/utils"
import {InitProvider, InitCurve, NextEndpoint, EndpointParams,txid,address,Filter} from "./types"

/**
 * Manage Providers and Curves registration
 * @extends BaseContract
 * @param {any} artifactsDir
 * @param {any} networkId
 * @param {any} networkProvider
 */
export class ZapRegistry extends BaseContract {
    contract:any;

    constructor({artifactsDir=undefined,networkId=undefined,networkProvider=undefined}:BaseContractType){
        super({artifactsDir,artifactName:"Registry",networkId,networkProvider});
    }

    /**
     * Add a brand new provider in Registry contract, distinguished by provider's address
     * @param {string} provider's public_key
     * @param {string} provider's title
     * @param {string} endpoint
     * @param {Array<string>} endpoint_params
     * @param {address} from : provider's address
     * @param {BigNumber} gas
     * @returns {Promise<txid>}
     */
    async initiateProvider({public_key, title, endpoint, endpoint_params, from, gas=Utils.Constants.DEFAULT_GAS}:InitProvider): Promise<txid>{
        let params:Array<string>;
        if(!endpoint_params) params = []
        else params = endpoint_params.map((item:string) =>{return utf8ToHex(item)});
        return await this.contract.methods.initiateProvider(
            toBN(public_key),
            utf8ToHex(title),
            utf8ToHex(endpoint),
            params)
            .send({from,gas});
    }

    /**
     * Set Curve for a provider's endpoint
     * Curve can only be set once per endpoint
     * @param {string} endpoint
     * @param {CurveType} curve
     * @param {address} from : provider
     * @param {BigNumber} gas
     * @returns {Promise<txid>}
     */
    async initiateProviderCurve({endpoint, curve, from, gas=Utils.Constants.DEFAULT_GAS}:InitCurve):Promise<txid> {
        let convertedConstants = curve.constants.map((item:number) => {
            return toHex(item);
        });
        let convertedParts = curve.parts.map((item:number)=> {
            return toHex(item);
        });
        let convertedDividers = curve.dividers.map((item:number) => {
            return toHex(item);
        });
        return await this.contract.methods.initiateProviderCurve(
            utf8ToHex(endpoint),
            convertedConstants,
            convertedParts,
            convertedDividers)
            .send({from, gas});
    }

    /**
     * Provider can set endpoint params for owned endpoint
     * @param {string} endpoint
     * @param {string[]} endpoint_params
     * @param {address} from : provider
     * @param {BigNumber} gas
     * @returns {Promise<txid>}
     */
    async setEndpointParams({endpoint, endpoint_params, from, gas=Utils.Constants.DEFAULT_GAS}:EndpointParams) :Promise<txid>{
      let params = endpoint_params ? endpoint_params.map(el =>{return utf8ToHex(el)}) : [];
        return await this.contract.methods.setEndpointParams(
            utf8ToHex(endpoint),
            params).send({from, gas});
    }

    /**
     * Get a provider's public key from Registry contract
     * @param {address} provider
     * @returns {Promise<number>}
     */
    async getProviderPublicKey(provider:address):Promise<number>{
        let pubKey:string =  await this.contract.methods.getProviderPublicKey(provider).call();
        return Number(pubKey.valueOf());
    }

    /**
     * Get a provider's title from Registry contract
     * @param {address} provider
     * @returns {Promise<string>}
     */
    async getProviderTitle(provider:address):Promise<string>{
        let title = await this.contract.methods.getProviderTitle(provider).call();
        return hexToUtf8(title)
    }


    /**
     * Get a provider's endpoint's curve from Registry contract
     * @param {string} provider
     * @param {string} endpoint
     * @returns {Promise<CurveType>}
     */
    async getProviderCurve(provider:string,endpoint:string):Promise<CurveType>{
        let curve =  await this.contract.methods.getProviderCurve(
            provider,
            utf8ToHex(endpoint)
        ).call();
        return new Curve(curve['0'].map((i:string)=>parseInt(i)),curve['1'].map((i:string)=>parseInt(i)),curve['2'].map((i:string)=>parseInt(i)))
    }

    /**
     * Get provider in index +1 in Registry contract
     * @param index of next provider
     * @returns {Promise<any>}
     */
    async getNextProvider(index:number):Promise<any>{
        return await this.contract.methods.getNextProvider(index).call();
    }


    /**
     * Get endpoint params at index of a provider's endpoint
     * @param {address} provider
     * @param {string} endpoint
     * @param {number} index
     * @returns {Promise<string>} endpoint's param at index
     */
    async getNextEndpointParams({provider, endpoint, index}:NextEndpoint):Promise<string>{
        let params = await  this.contract.methods.getNextEndpointParam(
            provider,
            utf8ToHex(endpoint),
            toBN(index)
        ).call();
        let endpointParams = params.endpointParam;
        console.log(hexToUtf8(endpointParams));
        return hexToUtf8(endpointParams)
    }

    // ==== Events ====//

    /**
     * Listen to all Registry contract events with filters
     * @param {Filter} filters
     * @param {Function} callback
     * @returns {Promise<void>}
     */
    async listen(filters:Filter={}, callback:Function):Promise<void>{
        this.contract.events.allEvents(filters, callback);
    }

    /**
     * Listen to Registry contracts events for new providers
     * @param {Filter} filters
     * @param {Promise<void>} callback
     */
    async listenNewProvider(filters:Filter={}, callback:Function):Promise<void>{
        this.contract.events.NewProvider(filters, callback);
    }

    /**
     * Listen to Registry contract's events for new providers' curve
     * @param {address} provider
     * @param {Promise<void>} callback
     */
    async listenNewCurve(provider:address, callback:Function):Promise<void>{
        this.contract.events.NewCurve(provider, callback);
    }

}

export * from "./types" ;
