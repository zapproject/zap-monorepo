const Web3 = require('web3');
const web3 = new Web3();
import BaseContract;
import {InitProvider, InitCurve, Curve, NextEndpoint, EndpointParams} from "./types"

class ZapRegistry extends BaseContract {

    constructor({networkId=null,networkProvider=null}={}){
        super({contract:"Registry",networkId,networkProvider});
    }

    async initiateProvider({public_key, title, endpoint, endpoint_params, from, gas}:InitProvider) {
        try {
            return await this.contract.methods.initiateProvider(
                public_key,
                title,
                endpoint,
                endpoint_params)
                .send({
                        from: from,
                        gas: gas || this.DEFAULT_GAS,
                    }
                );
        } catch (err) {
            throw err;
        }
    }

    async initiateProviderCurve({endpoint, curve, from, gas}:InitCurve) {
        try {
            let convertedConstants = curve.constants.map(item => {
                return web3.utils.toHex(item);
            });
            let convertedParts = curve.parts.map(item => {
                return web3.utils.toHex(item);
            });
            let convertedDividers = curve.dividers.map(item => {
                return web3.utils.toHex(item);
            });
            return await this.contract.methods.initiateProviderCurve(
                this.web3.utils.utf8ToHex(endpoint),
                convertedConstants,
                convertedParts,
                convertedDividers)
                .send({
                    from: from,
                    gas: gas || this.DEFAULT_GAS,
                });
        } catch (err) {
            throw err;
        }
    }

    async setEndpointParams({endpoint, params, from, gas}:EndpointParams) {
        try {
            let endpoint_params = [];
            params.forEach(el => endpoint_params.push(web3.utils.utf8ToHex(el)));
            return await this.contract.methods.setEndpointParams(
                endpoint,
                endpoint_params).send({
                from: from,
                gas: gas || this.DEFAULT_GAS,
            });
        } catch (err) {
            throw err;
        }
    }

    async getProviderPublicKey(provider:string):string{
        return await this.contract.methods.getProviderPublicKey(provider).call();
    }

    async getProviderTitle(provider:string):string{
        return await this.contract.methods.getProviderTitle(provider).call();
    }

    /**
     *
     * @param provider address
     * @returns {Promise<any>}
     */
    async getProviderCurve(provider:string):Curve{
        return await this.contract.methods.getProviderCurve.call(provider).call();
    }

    /**
     *
     * @param index
     * @returns {Promise<any>}
     */
    async getNextProvider(index:number){
        return await this.contract.methods.getNextProvider(index).call();
    }

    /**
     *
     * @param provider
     * @param endpoint
     * @param index
     * @returns {Promise<any>}
     */
    async getNextEndpointParams({provider, endpoint, index}:NextEndpoint){
        return this.contract.methods.getNextEndpointParam(
            provider,
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(index)
        ).call();
    }

    // ==== Events ====//

    async listen(filters:object={}, callback:Function){
        this.contract.events.allEvents(filters, callback);
    }

    async listenNewProvider(filters:object={}, callback:Function){
        this.contract.events.NewProvider(filters, callback);
    }

    async listenNewCurve({provider}:{provider:string}, callback:Function){
        this.contract.events.NewCurve(provider, callback);
    }

}

module.exports = {
  ZapRegistry,
  RegistryTypes :"./types"
}
