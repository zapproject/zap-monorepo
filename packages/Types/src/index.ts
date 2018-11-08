import {BigNumber} from "bignumber.js"
import {TransactionReceipt,TxData,ContractAbi} from "ethereum-types";

export type address = string;
export type txid = string;
export const  DEFAULT_GAS = new BigNumber(600000)
export type BNType = BigNumber;

export interface defaultTx{
    from?:address,
    gas?: string|number|BNType
}

export interface listenEvent {
    filter ?: Filter;
    callback: Function;
}

export interface Filter {
    fromBlock ?: number|BNType,
    toBlock ?: number|BNType,
    provider ?: address,
    subscriber ?:address,
    terminator ?:address,
    id ?: number|string|BNType
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
export interface SubscriptionInit extends defaultTx{
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : number,
    pubkey:number
}

export interface DataPurchaseEvent extends Filter{
    publicKey ?: number|string|BNType,
    amount ?: number|string|BNType,
    endpoint ?: string,
    endpointParams ?: string[]
}
export interface SubscriptionEndEvent extends Filter{
    terminator ?: address
}

export interface ParamsPassedEvent {
    sender ?: address,
    receiver ?: address,
    endpoint ?: string,
    params ?: string
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
    contract ?: any,
    coordinator ?:string
}
export interface NetworkProviderOptions{
    artifactsDir ?:string|undefined,
    networkId?: number|undefined,
    networkProvider: any,
    coordinator ?:string
}

export interface TransferType extends defaultTx{
    to:address,
    amount:BigNumber|string|number
}

export interface QueryArgs extends defaultTx {
    provider:address,
    endpoint: string,
    query: string,
    endpointParams : Array<string>,
    onchainProvider : boolean,
    onchainSubscriber : boolean
}

export interface ResponseArgs extends defaultTx{
    queryId : string,
    responseParams: Array<string>,
    dynamic : boolean
}
//=============Dispatch
export interface OffchainResponse{
    id?: number|string,
    subscriber?:address,
    provider?: address ,
    response?: string[]|number[],
    response1?:string,
    response2?:string,
    response3?:string,
    response4?:string
}


export const NULL_ADDRESS= '0x0000000000000000000000000000000000000000';

