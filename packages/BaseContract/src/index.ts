import * as assert from "assert";
const Web3 =require('web3');
import {Artifacts} from "@zap/artifacts";
import {BaseContractType} from "./types";
import {Utils} from "@zap/utils"

/**
 * Parent Class to Dispatch, Bondage, Arbiter, Token, Registry classes
 * Provides access to contract instances and the Web3 provider instance
 */
export class BaseContract{
    provider : any;
    web3:any;
    contract:any;
    networkId:number;

    /**
     * Creates a contract class wrapper for a given contract.
     * @param {string | null} artifactsDir Directory where contract ABIs are located
     * @param {string} artifactName Contract name for this contract object
     * @param {number | null} networkId Select which network the contract is located on (mainnet, testnet, private)
     * @param {any | null} networkProvider Ethereum network provider (e.g. Infura)
     */
    constructor({artifactsDir,artifactName,networkId,networkProvider}:BaseContractType) {
        let artifact:any = undefined;
        try {
          if(!artifactsDir){
            artifact = Artifacts[artifactName];
          }
          else{
            let artifacts:any = Utils.getArtifacts(artifactsDir);
            artifact = artifacts[artifactName];
          }
          this.provider = networkProvider ||
              new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
          //network id default to mainnet
          this.networkId = networkId || 1;
          this.web3 = new Web3(networkProvider);
          console.log("info : ", artifactsDir, this.networkId, artifact.networks)
          this.contract = new this.web3.eth.Contract(artifact.abi,artifact.networks[this.networkId].address)

        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the address of the owner of this contract.
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into the address of this contract's owner.
     */
    async getContractOwner():Promise<string>{
        return await this.contract.methods.owner().call().valueOf()
    }
}

export * from "./types"
