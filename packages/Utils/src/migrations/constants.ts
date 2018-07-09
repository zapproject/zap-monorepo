import {Curve} from "@zap/curve"
import * as Web3 from 'web3'
import {join} from "path";
import {serverOptions} from "./../types"
 Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
const  migrationDir = join(__dirname,'./../../../node_modules/zap_contracts/migrations')
const contractsDir = join(__dirname,'./../../../node_modules/zap_contracts/contracts')
const workingDir = join(__dirname,'./../../../node_modules/zap_contracts')
export const ganacheServerOptions={
     hostname: 'localhost',
     // "mnemonic": "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
     network_id: 5777,
     port: 7545,
     total_accounts: 10,
     ws: true,
    gas: 6721975 ,
    gasPrice: 10000000,
    network: "ganache-gui" ,
    //because zap_contracts use ganache-gui for port 7545
};
export let  buildOptions ={
    logger: console,
    contracts_build_directory: __dirname,
    contracts_directory:contractsDir,
    working_directory: workingDir,
    migrations_directory: migrationDir
} ;

export const testZapProvider = {
  pubkey: 111,
  title :"testProvider",
  params:  ["p1", "p2"],
  endpoint: "testEndpoint",
  query : "btcPrice",
  curve : new Curve([2, 2, 0, 1, 1, 1, 10, 0, 0], [0, 5, 5, 10], [1, 3])

}

export const ganacheProvider = new Web3.providers.WebsockerProvider('ws://127.0.0.1:7545');

export const GAS_LIMIT = 6721975
export const GAS_PRICE = 10000000
export const NETWORK = "ganache-gui"
