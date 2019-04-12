const {utf8ToHex, toBN, hexToUtf8, bytesToHex, hexToBytes} = require("web3-utils");
import {BaseContract} from "@zapjs/basecontract";
import {Curve,CurveType} from "@zapjs/curve";
import {ZapBondage} from "@zapjs/bondage";
import {ZapToken} from "@zapjs/zaptoken";
import {ZapRegistry} from "@zapjs/registry";
import  {Artifacts} from "@zapjs/artifacts";
import {InitProvider, InitCurve, NextEndpoint, EndpointParams, SetProviderParams, InitTokenCurve,
    Filter, txid,address,NetworkProviderOptions,DEFAULT_GAS,NULL_ADDRESS} from "@zapjs/types";
const Web3 = require("web3")

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

    async initializeCurve({ specifier, ticker, term, from, gasPrice, gas=DEFAULT_GAS}:any): Promise<txid> {

        let tx = await this.contract.methods.initializeCurve(
           utf8ToHex(specifier),
           utf8ToHex(ticker),
           term
        ).send({from:from, gas:gas});

        let curve = await this.zapRegistry.getProviderCurve(this.contract._address,specifier);
        return tx;
    }

    async bond({ specifier, dots, from, gasPrice, gas = DEFAULT_GAS }:any, events: any = {}):  Promise<txid>  {

        let zapRequired = await this.zapBondage.calcZapForDots({ provider: this.contract._address, endpoint: specifier, dots: dots });
        let approve = await this.zapToken.approve({
            to: this.contract._address,
            amount: zapRequired,
            from: from,
            gas,
            gasPrice
        });
        const promiEvent = this.contract.methods.bond( utf8ToHex(specifier), dots).send({from, gas,gasPrice});
        for(let event in events) {
            promiEvent.on(event, events[event]);
        }
        return promiEvent;
    }

    async approveBurn({ specifier, dots, from, gasPrice, gas = DEFAULT_GAS }:any, events: any = {}): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(specifier)).call();
        console.log('dot address ', dotAddress);
        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let dotBalance = await dotToken.methods.balanceOf(from).call();
        console.log('dot balance ', dotBalance);
        //Approval hangs. Should be approving token.approve for dot-token which has just been created by initializeCurve. Currently hangs
        const promiEvent = dotToken.methods.approve(this.contract._address, 9999999999999).send({ from, gas,gasPrice });
        for(let event in events) {
            promiEvent.on(event, events[event]);
        }
        return promiEvent;
    }

    async unbond({ specifier, dots, from, gasPrice, gas = DEFAULT_GAS }:any, events: any = {}): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(specifier)).call();
        console.log('dot address ', dotAddress);

        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let approved = await dotToken.methods.allowance(from, this.contract._address).call();
        console.log('approved ', approved);
        const promiEvent = this.contract.methods.unbond(utf8ToHex(specifier), dots).send({ from, gas, gasPrice });
        for(let event in events) {
            promiEvent.on(event, events[event]);
        }
        return promiEvent;
    }

    async getDotAddress({ specifier}:any): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(specifier)).call();
        console.log('dot address ', dotAddress);
        return dotAddress;
    }

    async getDotBalance({ specifier, from }:any): Promise<txid> {
        let dotAddress = await this.contract.methods.getTokenAddress(utf8ToHex(specifier)).call();
        console.log('dot address ', dotAddress);
        let dotToken = new this.provider.eth.Contract(Artifacts['ZAP_TOKEN'].abi, dotAddress);
        let dotBalance = await dotToken.methods.balanceOf(from).call();
        console.log('dot balance ', dotBalance);
        return dotBalance;
    }
}
