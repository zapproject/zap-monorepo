const {toHex,utf8ToHex,toBN, hexToUtf8} = require("web3-utils");
import {BaseContract,ContractType} from "@zapjs/basecontract";
import {Curve,CurveType} from "@zapjs/curve";
import {Utils} from "@zapjs/utils"
import {InitProvider, InitCurve, NextEndpoint, EndpointParams,txid,address,Filter} from "./types"

/**
 * Manage Providers and Curves registration
 * @extends BaseContract
 * @param {any} artifactsDir Directory where contract ABIs are located
 * @param {any} networkId Select which network the contract is located on (mainnet, testnet, private)
 * @param {any} networkProvider Ethereum network provider (e.g. Infura)
 */
 export class ZapRegistry extends BaseContract {
    contract:any;

    constructor(obj ?: ContractType){
        super(Object.assign(obj,{artifactName:"Registry"}));
    }


    /**
     * Initializes a brand endpoint in the Registry contract, creating an Oracle entry if needed.
     * @param {string} public_key A public identifier for this oracle
     * @param {string} title A descriptor describing what data this oracle provides
     * @param {string} endpoint Data endpoint of the provider
     * @param {Array<string>} endpoint_params The parameters that this endpoint accepts as query arguments
     * @param {address} from Ethereum Address of the account that is initializing this provider
     * @param {BigNumber} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
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
     * Initializes a piecewise curve for a given provider's endpoint. Note: curve can only be set once per endpoint.
     * @param {string} endpoint Data endpoint of the provider
     * @param {CurveType} curve A curve object representing a piecewise curve
     * @param {address} from The address of the owner of this oracle 
     * @param {BigNumber} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
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
     * Initialize endpoint params for an endpoint. Can only be called by the owner of this oracle.
     * @param {string} endpoint Data endpoint of the provider
     * @param {string[]} endpoint_params The parameters that this endpoint accepts as query arguments
     * @param {address} from The address of the owner of this oracle 
     * @param {BigNumber} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
     async setEndpointParams({endpoint, endpoint_params, from, gas=Utils.Constants.DEFAULT_GAS}:EndpointParams) :Promise<txid>{
      let params = endpoint_params ? endpoint_params.map(el =>{return utf8ToHex(el)}) : [];
      return await this.contract.methods.setEndpointParams(
        utf8ToHex(endpoint),
        params).send({from, gas});
  }

    /**
     * Get a provider's public key from the Registry contract.
     * @param {address} provider The address of this provider
     * @returns {Promise<number>} Returns a Promise that will eventually resolve into public key number
     */
     async getProviderPublicKey(provider:address):Promise<number>{
        let pubKey:string =  await this.contract.methods.getProviderPublicKey(provider).call();
        return Number(pubKey.valueOf());
    }

    /**
     * Get a provider's title from the Registry contract.
     * @param {address} provider The address of this provider
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into a title string
     */
     async getProviderTitle(provider:address):Promise<string>{
        let title = await this.contract.methods.getProviderTitle(provider).call();
        return hexToUtf8(title)
    }


    /**
     * Get a provider's endpoint's curve from the Registry contract.
     * @param {string} provider The address of this provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<CurveType>} Returns a Promise that will eventually resolve into a Curve object
     */
     async getProviderCurve(provider:string,endpoint:string):Promise<CurveType>{
        let curve =  await this.contract.methods.getProviderCurve(
            provider,
            utf8ToHex(endpoint)
            ).call();
        return new Curve(curve['0'].map((i:string)=>parseInt(i)),curve['1'].map((i:string)=>parseInt(i)),curve['2'].map((i:string)=>parseInt(i)))
    }

    /**
     * Get provider in index +1 in Registry contract.
     * @param index Index value of the next provider
     * @returns {Promise<any>} Returns a Promise that will eventually resolve into a Provider object
     */
     async getNextProvider(index:number):Promise<any>{
        return await this.contract.methods.getNextProvider(index).call();
    }


    /**
     * Get the endpoint params at a certain index of a provider's endpoint.
     * @param {address} provider The address of this provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {number} index The index value of this provider
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into the endpoint's param at this index
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
     * Listen to all Registry contract events
     * @param {Function} callback Callback function that is called whenever an event is emitted
     * @returns {Promise<void>} Returns a Promise that will eventually resolve when the callback is set
     */
     async listen(callback:Function):Promise<void>{
        this.contract.events.allEvents(callback);
    }

    /**
     * Listen to Registry contracts events for new providers
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Promise<void>} callback Returns a Promise that will eventually resolve when the callback is set
     */
     async listenNewProvider(filters:Filter={}, callback:Function):Promise<void>{
        this.contract.events.NewProvider(filters, callback);
    }

    /**
     * Listen to Registry contract's events for new providers' curve
     * @param {Filter} filters Filters events based on certain key parameters
     * @param {Promise<void>} callback Returns a Promise that will eventually resolve when the callback is set
     */
     async listenNewCurve(filters:Filter, callback:Function):Promise<void>{
        this.contract.events.NewCurve(filters, callback);
    }

}

export * from "./types" ;
