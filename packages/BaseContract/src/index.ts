import * as assert from "assert";
const Web3 =require('web3');
import {Artifacts} from "@zap/artifacts";
import {BaseContractType} from "./types";
import {getArtifacts} from "@zap/utils"

/**
 * Parent Class to Dispatch, Bondage, Arbiter, Token, Registry class
 * Provide access to contract instance and web3 provider instance
 * @param {string | null} artifactsDir
 * @param {string} artifactName
 * @param {number | null} networkId
 * @param {any | null} networkProvider : Ethereum network provider
 */
export class BaseContract{
    provider : any;
    web3:any;
    contract:any;
    networkId:number;


    constructor({artifactsDir=undefined,artifactName,networkId=undefined,networkProvider=undefined}:BaseContractType) {
        let artifact:any = undefined;
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

    /**
     * Get Contract owner address
     * @returns {Promise<string>} owner's address of this contract instance
     */
    async getContractOwner():Promise<string>{
        return await this.contract.methods.owner().call().valueOf()
    }
}

export * from "./types"
