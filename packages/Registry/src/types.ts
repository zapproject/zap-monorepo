import {CurveType} from "@zapjs/curve1"
import {BigNumber} from 'bignumber.js';
import {address,BNType} from "@zapjs/types"
export interface InitProvider  {
  public_key : string,
  title :string,
  endpoint: string,
  endpoint_params ?: Array<string>,
  from: address,
  gas ?: BNType
}


export type InitCurve = {
  endpoint:string,
  curve:CurveType,
  from: address,
  gas ?: BNType
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
  gas ?: BNType
}
export interface Filter  {
  fromBlock ?: number,
    toBlock ?: number,
    provider ?: address

}