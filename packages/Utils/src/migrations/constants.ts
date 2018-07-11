import {Curve} from "@zap/curve"
const Web3  = require('web3');
import {join} from "path";
import {serverOptionsType} from "./../types"
 Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
const  migrationDir = join(__dirname,'./../../../node_modules/zap_contracts/migrations')
const contractsDir = join(__dirname,'./../../../node_modules/zap_contracts/contracts')
const workingDir = join(__dirname,'./../../../node_modules/zap_contracts')
export const ganacheServerOptions={
     hostname: 'localhost',
     network_id: 5777,
     port: 7545,
     total_accounts: 10,
     ws: true,
    gas: 6721900 ,
    gasPrice: 20000000,
    network: "ganache-gui"
};
export let  buildOptions ={
    logger: console,
    contracts_build_directory: __dirname,
    contracts_directory:contractsDir,
    working_directory: workingDir,
    migrations_directory: migrationDir
} ;

export const testZapProvider:any = {
  pubkey: 111,
  title :"testProvider",
  endpoint_params:  ["p1", "p2"],
  endpoint: "testEndpoint",
  query : "btcPrice",
  curve : new Curve([2, 2, 0, 1, 1, 1, 10, 0, 0], [0, 5, 5, 1000], [1, 3])

}

export const ganacheProvider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');

export const DEFAULT_GAS = 6000000
export const GAS_PRICE = 40000000
export const NETWORK = "ganache-gui"
