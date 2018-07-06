import {Curve} from "@zap/curve"
import * as Web3 from 'web3'
 Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
export const ganacheServerOptions={
     hostname: 'localhost',
     // "mnemonic": "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
     network_id: 5777,
     port: 7545,
     total_accounts: 10,
     ws: true
}

export const testZapProvider = {
  pubkey: 111,
  title :"testProvider",
  params:  ["p1", "p2"],
  endpoint: "testEndpoint",
  query : "btcPrice",
  curve : new Curve([2, 2, 0, 1, 1, 1, 10, 0, 0], [0, 5, 5, 10], [1, 3])

}


export const GAS_LIMIT = 6721975
export const GAS_PRICE = 10000000
export const NETWORK = "ganache-gui"
