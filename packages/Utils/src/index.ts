import {readdirSync} from "fs";
import {ZapProviderType} from "./types";
import {clearBuild, getArtifacts, migrateContracts, startGanacheServer} from "./migrations";
const {utf8ToHex,toBN} = require("web3-utils");
const Web3 = require('web3');
const web3 = new Web3();

/**
 * @class
 * Utils
 */
export class Utils {
    /**
     *
     * @param {string} str
     * @returns {string}
     */
    static toHex(str: string) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16);
        }
        return `0x${hex}`;
    };

    /**
     *
     * @param {string} specifier
     * @returns {Buffer}
     */
    static getHexBuffer(specifier: string) {
        return new Buffer(specifier, 'hex')
    };

    static getHexString(str: string) {
        const data = new Buffer(str);
        console.log(data.byteLength);
        const hex = data.toString('hex');
        return `0x${hex}`;
    };

    /**
     *@ignore
     * @param contract
     * @returns {any}
     */
    static fixTruffleContractCompatibilityIssue(contract: any) {
        if (!contract.currentProvider.sendAsync || typeof contract.currentProvider.sendAsync !== 'function') {
            contract.currentProvider.sendAsync = function () {
                return contract.currentProvider.send.apply(
                    contract.currentProvider, arguments
                );
            };
        }
        return contract;
    };

    /**
     * @param {number} num
     * @returns {any}
     */
    static toZapBase(num: number) {
        return web3.utils.toBN(num).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
    }

    /**
     *
     * @param {number | string} num
     * @returns {number}
     */
    static fromZapBase(num: number|string):number {
        return web3.utils.toBN(num).div(web3.utils.toBN(10).pow(web3.utils.toBN(18))).toNumber();
    }

    /**
     *
     * @param {ZapProviderType} provider
     * @returns {ZapProviderType}
     */
    static normalizeProvider(provider: ZapProviderType): ZapProviderType {
        let normalize: any = {};
        normalize.title = utf8ToHex(provider.title);
        normalize.pubkey = toBN(provider.pubkey);
        normalize.endpoint = utf8ToHex(provider.endpoint);
        normalize.endpoint_params = [];
        for (let i in provider.endpoint_params) {
            normalize.endpoint_params[i] = utf8ToHex(provider.endpoint_params[i]);
        }
        return normalize;
    }

    /**
     *@ignore
     * @param artifact
     * @param {number} id
     * @param provider
     * @returns {Contract}
     */
    static getDeployedContract(artifact: any, {id}: { id: number }, provider: any) {
        const web3 = new Web3(provider);
        let instance = new web3.eth.Contract(artifact, artifact.networkS[id].address);
        instance = this.fixTruffleContractCompatibilityIssue(instance);
        return instance;
    }
    static getArtifacts = getArtifacts
    static migrateContracts = migrateContracts
    static clearBuild = clearBuild
    static  startGanacheServer = startGanacheServer;
    static Constants = require("./constants")




}


export * from "./types"
