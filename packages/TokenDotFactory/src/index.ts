
const {utf8ToHex, fromWei,toWei} = require("web3-utils");
import {BaseContract} from "@zapjs/basecontract";
import {ZapBondage} from "@zapjs/bondage";
import {ZapToken} from "@zapjs/zaptoken";
import {ZapRegistry} from "@zapjs/registry";
import  {Artifacts} from "@zapjs/artifacts";
import {InitDotTokenCurve,txid,address,NetworkProviderOptions,DEFAULT_GAS,EndpointMethods,TokenBondType} from "@zapjs/types";

export class TokenDotFactory extends BaseContract {

    zapBondage : ZapBondage;
    zapToken: ZapToken;
    zapRegistry: ZapRegistry;

    constructor(options ?: NetworkProviderOptions){
        super(Object.assign(options,{artifactName:"TOKENDOTFACTORY"}));

        this.zapToken = new ZapToken(options);
        this.zapBondage = new ZapBondage(options);
        this.zapRegistry = new ZapRegistry(options);

    }

    /**
     * Initiate Token Endpoint, return address of the Token Contract
     * @param endpoint
     * @param symbol
     * @param term
     * @param from
     * @param gasPrice
     * @param gas
     */
    async initializeTokenCurve({ endpoint, symbol, term, from, gasPrice, gas=DEFAULT_GAS}:InitDotTokenCurve): Promise<txid> {
        let tx = await this.contract.methods.initializeCurve(
           utf8ToHex(endpoint),
           utf8ToHex(symbol),
           term
        ).send({from, gas, gasPrice});
        return tx;
    }

    /**
     * Bond to Token Endpoint
     * @param endpoint
     * @param dots
     * @param from
     * @param gasPrice
     * @param gas
     */
    async bondTokenDot({ endpoint, dots, from, gasPrice, gas = DEFAULT_GAS }:TokenBondType):  Promise<txid>  {
        let zapRequired = await this.zapBondage.calcZapForDots({ provider: this.contract._address, endpoint: endpoint, dots: dots });
        let allowance = await this.zapToken.contract.methods.allowance(from,this.zapBondage.contract._address);
        if(fromWei(zapRequired,"ether")<fromWei(allowance,"ether")){
            throw "Allowance is smaller than amount Zap required"
        }
        return await this.contract.methods.bond(utf8ToHex(endpoint), dots).send({from, gas,gasPrice});
    }

    /**
     * Approve big amount of token for burning
     * @param endpoint
     * @param from
     * @param gasPrice
     * @param gas
     */
    async approveBurnTokenDot({ endpoint, from, gasPrice, gas = DEFAULT_GAS }:EndpointMethods): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(endpoint)).call();
        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let dotBalance = await dotToken.methods.balanceOf(from).call();
        //Approval hangs. Should be approving token.approve for dot-token which has just been created by initializeCurve. Currently hangs
        return await dotToken.methods.approve(this.contract._address, 9999999999999).send({ from, gas,gasPrice });
    }

    /**
     * Unbond to Token Endpoint
     * @param endpoint
     * @param dots
     * @param from
     * @param gasPrice
     * @param gas
     */
    async unbondTokenDot({ endpoint, dots, from, gasPrice, gas = DEFAULT_GAS }:TokenBondType): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(endpoint)).call();
        console.log('dot address ', dotAddress);

        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let approved = await dotToken.methods.allowance(from, this.contract._address).call();
        console.log('approved ', approved);
        return await this.contract.methods.unbond(utf8ToHex(endpoint), dots).send({ from, gas, gasPrice });
    }

    /**
     * Get Address of certain Token Endpoint
     * @param endpoint
     */
    async getDotAddress(endpoint:string): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(endpoint)).call();
        console.log('dot address ', dotAddress);
        return dotAddress;
    }

    /**
     * Get Token Dot balance
     * @param endpoint
     * @param from
     */
    async getDotBalance({ endpoint, from }:{endpoint:string,from:address}): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(endpoint)).call();
        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let dotBalance = await dotToken.methods.balanceOf(from).call();
        console.log('dot balance ', dotBalance);
        return dotBalance;
    }
}
