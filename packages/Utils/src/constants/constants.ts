import {Curve} from "@zap/curve"
import {toBN} from "web3-utils"
export const ganacheServerOptions = {
  ganacheServerOptions : {
     hostname: 'localhost',
     // "mnemonic": "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
     network_id: 5777,
     port: 7545,
     total_accounts: 10,
     ws: true,
 }
}

export const testProvider = {
  pubkey: 111,
  title :"testProvider",
  params:  ["p1", "p2"],
  endpoint: "testEndpoint",
  query : "btcPrice",
  curve : new Curve([2, 2, 0, 1, 1, 1, 10, 0, 0], [0, 5, 5, 10], [1, 3])

}


export const DEFAULT_GAS = {gas:toBN(600000)};
