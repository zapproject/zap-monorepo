import * as assert from "assert";
const Web3 =require('web3');
import {Artifacts} from "@zap/artifacts";
import {BaseContractType} from "./types";
import {getArtifacts} from "@zap/utils"
export class BaseContract{
    provider : any;
    web3:any;
    contract:any;
    networkId:number;
    constructor({artifactsDir=null,artifactName,networkId=null,networkProvider=null}:BaseContractType) {
        let artifact:any = null;
        try {
          if(!artifactsDir){
            artifact = Artifacts[artifactName];
          }
          else{
            let artifacts:any = getArtifacts(artifactsDir);
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
