const assert = require("assert");
const Web3 = require("web3");
const Artifacts = require("artifacts");
import {contractsLoader} from '@zap/utils'
import {baseContractType} from "./types";

class Base {
    constructor({artifactsDir,artifactName,networkId,provider}:baseContractType) {
      let artifact;
        try {
          if(!artifactsDir){
            artifact = Artifacts[artifactName];
          }
          else{
            let artifacts = contractLoader(artifactsDir)
            artifact = artifacts[artifactName];
          }
          this.provider = provider ||
              new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
          //network id default to mainnet
          this.networkId = networkId || 1;
          this.DEFAULT_GAS = 400000;
          this.web3 = new Web3(this.provider);
          this.contract = new this.web3.eth.Contract(artifact.abi,artifact.networks[this.networkId].address)
          console.log(this.contract)

        } catch (err) {
            throw err;
        }
    }
}

module.exports = Base;
