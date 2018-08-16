const {toHex,utf8ToHex,toBN, hexToUtf8} = require("web3-utils");
import {BaseContract} from "@zapjs/basecontract";
import {Curve,CurveType} from "@zapjs/curve";
import {InitProvider, InitCurve, NextEndpoint, EndpointParams, SetProviderParams} from "./types"
import {Filter, txid,address,NetworkProviderOptions,DEFAULT_GAS} from "@zapjs/types";

/**
 * Manage Providers and Curves registration
 * @extends BaseContract
 * @param {any} artifactsDir Directory where contract ABIs are located
 * @param {any} networkId Select which network the contract is located on (mainnet, testnet, private)
 * @param {any} networkProvider Ethereum network provider (e.g. Infura)
 */
 export class ZapRegistry extends BaseContract {

    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj,{artifactName:"Registry"}));
    }


    /**
     * Initializes a brand endpoint in the Registry contract, creating an Oracle entry if needed.
     * @param {string} public_key A public identifier for this oracle
     * @param {string} title A descriptor describing what data this oracle provides
     * @param {address} from Ethereum Address of the account that is initializing this provider
     * @param {BigNumber} gas Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async initiateProvider({public_key, title, from, gas=DEFAULT_GAS}:InitProvider): Promise<txid>{
        let params:Array<string>;
        return await this.contract.methods.initiateProvider(
            toBN(public_key),
            utf8ToHex(title))
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
    async initiateProviderCurve({endpoint, term, from, gas=DEFAULT_GAS}:InitCurve):Promise<txid> {
       let curve = new Curve(term);
        let convertedCurve = curve.convertToBNArrays()
        return await this.contract.methods.initiateProviderCurve(utf8ToHex(endpoint), convertedCurve)
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
    async setEndpointParams({endpoint, endpoint_params, from, gas=DEFAULT_GAS}:EndpointParams) :Promise<txid>{
      let params = endpoint_params ? endpoint_params.map(el =>{return utf8ToHex(el)}) : [];
      return await this.contract.methods.setEndpointParams(
        utf8ToHex(endpoint),
        params).send({from, gas});
    }

    /**
     * Set the parameter of a provider
     * @param {string} key The key to be set
     * @param {string} value The value to set the key to
     * @param {address} from The address of the provider
     * @param {BN} gas The amount of gas to use.
     * @returns {Promise<txid>} Returns a Promise that will be eventually resolve into a transaction hash
     */
    async setProviderParameter({ key, value, from, gas=DEFAULT_GAS }: SetProviderParams): Promise<txid> {
        return await this.contract.methods.setProviderParameter(
            utf8ToHex(key),
            utf8ToHex(value)
        ).send({ from, gas });
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
     * Gets whether this provider has already been created
     * @param {address} provider The address of this provider
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve a true/false value.
     */
    async isProviderInitiated(provider:address):Promise<boolean> {
        const created:boolean = await this.contract.methods.isProviderInitiated(provider);
        return created;
    }

    /**
     * Gets whether this endpoint and its corresponding curve have already been set
     * @param {address} provider The address of this provider
     * @returns {Promise<boolean>} Returns a Promise that will eventually resolve a true/false value.
     */
    async isEndpointSet(provider:address, endpoint:string):Promise<boolean> {
        const notCreated:boolean = await this.contract.methods.getCurveUnset(provider, endpoint);
        return !notCreated;
    }


    /**
     * Get a provider's endpoint's curve from the Registry contract.
     * @param {string} provider The address of this provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<CurveType>} Returns a Promise that will eventually resolve into a Curve object
     */
    async getProviderCurve(provider:string,endpoint:string):Promise<Curve>{
        const term:string[] =  await this.contract.methods.getProviderCurve(
            provider,
            utf8ToHex(endpoint)
            ).call();
        return new Curve(term.map((i:string)=>{return parseInt(i)}))
    }

    /**
     * Get all providers in Registry contract.
     * @returns {Promise<any>} Returns a Promise that will eventually resolve into a Provider object
     */
    async getAllProviders(): Promise<any> {
        return await this.contract.methods.getAllOracles().call();
    }

    /**
     * Get a parameter from a provider
     * @param {string} provider The address of the provider
     * @param {string} key The key you're getting
     * @returns {Promise<string>} A promise that will be resolved with the value of the key
     */
    async getProviderParam(provider: string, key: string): Promise<string> {
        return await this.contract.methods.getProviderParameter(
            provider,
            utf8ToHex(key)
        ).call();
    }

    /**
     * Get all the parameters of a provider
     * @param {string} provider The address of the provider
     * @returns {Promise<string[]>} A promise that will be resolved with all the keys
     */
    async getAllProviderParams(provider: string): Promise<string[]> {
        return await this.contract.methods.getAllProviderParams(provider).call().map(utf8ToHex);
    }

    /**
     * Get the endpoint params at a certain index of a provider's endpoint.
     * @param {address} provider The address of this provider
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into the endpoint's param at this index
     */
    async getEndpointParams({provider, endpoint}:NextEndpoint):Promise<string>{
        const params = await this.contract.methods.getEndpointParams(
            provider,
            utf8ToHex(endpoint)
        ).call();

        return params.map(hexToUtf8);
    }

    /**
     * Get the endpoints of a given provider
     * @param {address} provider The address of this provider
     * @returns {Promise<string[]>} Returns a Promise that will be eventually resolved with the endpoints of the provider.
     */
    async getProviderEndpoints(provider: string): Promise<string[]> {
        const endpoints = await this.contract.methods.getProviderEndpoints(provider).call();
        return endpoints.map(utf8ToHex);
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
