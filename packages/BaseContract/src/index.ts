const  {Artifacts} =require("@zapjs/artifacts1");
import {BaseContractType} from "@zapjs/types";
import {Utils} from "./utils"
const Web3 = require("web3")

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
        console.log(artifactsDir,artifactName,networkId)
        let artifact:any = undefined;
        try {
          if(!artifactsDir){
            artifact = Artifacts[artifactName];
          }
          else{
            let artifacts:any= Utils.getArtifacts(artifactsDir);
            artifact = artifacts[artifactName];
          }
          let currentProvider = networkProvider || new Web3.providers.HttpProvider("http://localhost:8545");
          this.provider = new Web3(currentProvider)
            //network id default to mainnet
          this.networkId = networkId || 1;
          this.contract = new this.provider.eth.Contract(artifact.abi,artifact.networks[this.networkId].address)
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

