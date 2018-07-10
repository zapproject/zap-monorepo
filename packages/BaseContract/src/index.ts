import * as assert from "assert";
import * as Web3 from 'web3';
import {Artifacts} from "@zap/artifacts";
import {BaseContractType} from "./types";
import {getArtifacts} from "@zap/utils"

export class BaseContract {
    constructor({artifactsDir=null,artifactName,networkId=null,networkProvider=null}:BaseContractType) {
        let artifact;
        try {
          if(!artifactsDir){
            artifact = Artifacts[artifactName];
          }
          else{
            let artifacts = getArtifacts(artifactsDir)
            artifact = artifacts[artifactName];
          }
          this.provider = networkProvider ||
              new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
          //network id default to mainnet
          this.networkId = networkId || 1;
          this.web3 = new Web3(networkProvider);
          this.contract = new this.web3.eth.Contract(artifact.abi,artifact.networks[this.networkId].address)

        } catch (err) {
            throw err;
        }
    }
}

export * from "./types"

