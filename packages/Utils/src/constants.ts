import {Curve} from "@zap/curve"
const Web3  = require('web3');
import {join,dirname} from "path";
import {serverOptionsType} from "./types"
const requireAll = require("require-all")
 Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
const zapContractDirName = dirname(require.resolve("zap_contracts/truffle-config.js"))
const { provider} = require('ganache-core');
const  migrationDir = join(zapContractDirName,"migrations")
const contractsDir = join(zapContractDirName,"contracts")
const workingDir = zapContractDirName
console.log("working dir : ", workingDir)
export const  migrate = require("truffle-core/lib/commands/migrate.js");
export const ganacheServerOptions={
     hostname: 'localhost',
     network_id: 5777,
     port: 7545,
     total_accounts: 10,
     ws: true,
    gas: 6700000 ,
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

//export const ganacheProvider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:7550');
export const ganacheProvider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545');

export const DEFAULT_GAS = 6000000
export const GAS_PRICE = 40000000
export const NETWORK = "ganache-gui"
