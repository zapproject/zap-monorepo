import {CurveType} from "@zap/curve"
import BigNumber from 'bignumber.js';

export type address = string;
export type txid = string;
export interface InitProvider  {
  public_key : string,
  title :string,
  endpoint: string,
  endpoint_params ?: Array<string>,
  from: address,
  gas ?: BigNumber
}


export type InitCurve = {
  endpoint:string,
  curve:CurveType,
  from: address,
  gas ?: BigNumber
}


export type NextEndpoint = {
  provider:address,
  endpoint: string,
  index:number
}

export type EndpointParams = {
  endpoint:string,
  endpoint_params: string[],
  from: address,
  gas ?: BigNumber
}
export interface Filter  {
  fromBlock ?: number,
    toBlock ?: number,
    provider ?: address

}