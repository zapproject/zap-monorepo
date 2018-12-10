const {utf8ToHex, toBN, hexToUtf8, bytesToHex, hexToBytes} = require("web3-utils");
import {BaseContract} from "@zapjs/basecontract";
import {Curve,CurveType} from "@zapjs/curve";
import {ZapBondage} from "@zapjs/bondage";
import {ZapToken} from "@zapjs/zaptoken";
import {InitProvider, InitCurve, NextEndpoint, EndpointParams, SetProviderParams, InitTokenCurve} from "./types"
import {Filter, txid,address,NetworkProviderOptions,DEFAULT_GAS,NULL_ADDRESS} from "@zapjs/types";

export class TokenDotFactory extends BaseContract {

    zapBondage : ZapBondage;
    zapToken: ZapToken;

    constructor(options ?: NetworkProviderOptions){
        super(Object.assign(options,{artifactName:"TOKENDOTFACTORY"}));

        this.zapToken = new ZapToken(options);
        this.zapBondage = new ZapBondage(options);
    }

    async initializeCurve({ specifier, ticker, term, from, gas=DEFAULT_GAS}:any): Promise<txid> {

        return await this.contract.methods.initializeCurve(
           utf8ToHex(specifier),
           utf8ToHex(ticker),
           term
        ).send({from:from, gas:gas});
    }
}

export * from "./types" ;
