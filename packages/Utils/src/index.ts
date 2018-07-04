const Web3 = require('web3');
const web3 = new Web3();
import {testProvider,GAS_LIMIT} from "./constants"

const toHex = (str:string) => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return `0x${hex}`;
};

const getHexBuffer = (specifier:string) => new Buffer(specifier, 'hex');

const getHexString = (str:string) => {
    const data = new Buffer(str);
    console.log(data.byteLength);
    const hex = data.toString('hex');
    return `0x${hex}`;
};

const fixTruffleContractCompatibilityIssue = (contract) => {
    if (!contract.currentProvider.sendAsync || typeof contract.currentProvider.sendAsync !== 'function') {
        contract.currentProvider.sendAsync = function() {
            return contract.currentProvider.send.apply(
                contract.currentProvider, arguments
            );
        };
    }
    return contract;
};

function toBase(num:number){
    return web3.utils.toBN(num).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
}

function fromBase(num:number) {
    return web3.utils.toBN(num).div(web3.utils.toBN(10).pow(web3.utils.toBN(18))).toNumber();
}

function testContractsLoader(){
    let contracts = {}
    const path = require("path");
    require('fs').readdirSync(path.join(__dirname,'/contracts')).forEach(function (file) {
        /* If its the current file ignore it */
        if (file === 'index.js') return;

        /* Store module with its name (from filename) */
        contracts[path.basename(file, '.json')] = require(path.join(__dirname,'/contracts/', file));
    });
    return contracts;
  }

  function getDeployedContract(artifact, { id }, provider) {
    const web3 = new Web3(provider)
    let instance = new web3.eth.Contract(artifact, artifact,network[id].address);
    instance = fixTruffleContractCompatibilityIssue(instance);
    return instance;
  }


export= {
    toHex,
    getHexBuffer,
    getHexString,
    fixTruffleContractCompatibilityIssue,
    toBase,
    fromBase,
    testContractsLoader,
    getDeployedContract,
    Bootstrap : "./testBootstrap",
    testProvider,
    GAS_LIMIT
}
