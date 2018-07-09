import {readdirSync} from "fs";

const Web3 = require('web3');
const web3 = new Web3();
export const toHex = (str:string) => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return `0x${hex}`;
};

export const getHexBuffer = (specifier:string) => new Buffer(specifier, 'hex');

export const getHexString = (str:string) => {
    const data = new Buffer(str);
    console.log(data.byteLength);
    const hex = data.toString('hex');
    return `0x${hex}`;
};

export function fixTruffleContractCompatibilityIssue(contract) {
    if (!contract.currentProvider.sendAsync || typeof contract.currentProvider.sendAsync !== 'function') {
        contract.currentProvider.sendAsync = function() {
            return contract.currentProvider.send.apply(
                contract.currentProvider, arguments
            );
        };
    }
    return contract;
};

export function toBase(num:number){
    return web3.utils.toBN(num).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
}

export function fromBase(num:number) {
    return web3.utils.toBN(num).div(web3.utils.toBN(10).pow(web3.utils.toBN(18))).toNumber();
}

export function getDeployedContract(artifact, { id }, provider) {
const web3 = new Web3(provider);
let instance = new web3.eth.Contract(artifact, artifact.networkS[id].address);
instance = fixTruffleContractCompatibilityIssue(instance);
return instance;
}


export * from "./migrations"
