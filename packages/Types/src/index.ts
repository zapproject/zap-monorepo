import {BigNumber} from "bignumber.js"
import {TransactionReceipt,TxData,ContractAbi} from "ethereum-types";

export type address = string;
export type txid = string;
export const  DEFAULT_GAS = new BigNumber(300000)
export type BNType = BigNumber;


export interface listenEvent {
    filter ?: Filter;
    callback: Function;
}
export interface Filter {
    fromBlock ?: number,
    toBlock ?: number,
    provider ?: address,
    subscriber ?:address,
    terminator ?:address
}

export interface Artifact {
    contract_name: string,
    abi : ContractAbi,
    networks: {
        [networkId: string]:{
            address:string
        }
    }
}

//==Arbiter
export interface SubscriptionInit {
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number,
    pubkey:number,
    from: address,
    gas?: number
}

export interface SubscriptionEnd {
    provider?:address,
    subscriber ?:address,
    endpoint : string,
    from: address,
    gas?:number
}


export interface SubscriptionType {
    provider:address,
    subscriber:address,
    endpoint:string
}

//== Base contract
export interface BaseContractType  {
    artifactsDir ?:string|undefined,
    artifactName: string,
    networkId?: number|undefined,
    networkProvider?: any|undefined,
    contract ?: any
}
export interface NetworkProviderOptions {
    artifactsDir ?:string|undefined,
    networkId?: number|undefined,
    networkProvider: any
}

export type TransferType = {
    to:address,
    amount:number,
    from:address,
    gas ?: number
}



