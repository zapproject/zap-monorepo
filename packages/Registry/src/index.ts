import {toHex,utf8ToHex,toBN, hexToUtf8} from "web3-utils";
import {BaseContract,BaseContractType} from "@zap/basecontract";
import {CurveType} from "@zap/curve";
import {GAS_LIMIT} from "@zap/utils"
import {InitProvider, InitCurve, NextEndpoint, EndpointParams} from "./types"
console.log(BaseContract)
export class ZapRegistry extends BaseContract {

    constructor({artifactsDir=null,networkId=null,networkProvider=null}:BaseContractType){
        console.log("in registry constructor : ", artifactsDir, networkId,networkProvider)
        super({artifactsDir,artifactName:"Registry",networkId,networkProvider});
    }

    async initiateProvider({public_key, title, endpoint, endpoint_params, from, gas=GAS_LIMIT}:InitProvider) {
        try {
            if(!endpoint_params){
                endpoint_params=[];
            }
            else if(endpoint_params.length >0) {
                for (let i in endpoint_params) {
                    endpoint_params[i] = utf8ToHex(endpoint_params[i])
                }
            }
            return await this.contract.methods.initiateProvider(
                toBN(public_key),
                utf8ToHex(title),
                utf8ToHex(endpoint),
                endpoint_params)
                .send({from,gas});
        } catch (err) {
            throw err;
        }
    }

    async initiateProviderCurve({endpoint, curve, from, gas}:InitCurve) {
        try {
            let convertedConstants = curve.constants.map(item => {
                return toHex(item);
            });
            let convertedParts = curve.parts.map(item => {
                return toHex(item);
            });
            let convertedDividers = curve.dividers.map(item => {
                return toHex(item);
            });
            return await this.contract.methods.initiateProviderCurve(
                this.web3.utils.utf8ToHex(endpoint),
                convertedConstants,
                convertedParts,
                convertedDividers)
                .send({from, gas});
        } catch (err) {
            throw err;
        }
    }

    async setEndpointParams({endpoint, params, from, gas}:EndpointParams) {
        try {
            let endpoint_params = [];
            params.forEach(el => endpoint_params.push(utf8ToHex(el)));
            return await this.contract.methods.setEndpointParams(
                endpoint,
                endpoint_params).send({from, gas});
        } catch (err) {
            throw err;
        }
    }

    async getProviderPublicKey(provider:string):Promise<string>{
        let pubKey =  await this.contract.methods.getProviderPublicKey(provider).call();
        return Number(pubKey.valueOf());
    }

    async getProviderTitle(provider:string):Promise<string>{
        let title = await this.contract.methods.getProviderTitle(provider).call();
        return hexToUtf8(title)
    }

    /**
     *
     * @param provider address
     * @returns {Promise<any>}
     */
    async getProviderCurve(provider:string):Promise<Curve>{
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
        let params = await  this.contract.methods.getNextEndpointParam(
            provider,
            this.web3.utils.utf8ToHex(endpoint),
            this.web3.utils.toBN(index)
        ).call();
        console.log(params.Result.endpointParams)
        return hexToUtf8(params.Result.endpointParams)
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

export * from "./types" ;
