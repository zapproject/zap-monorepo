import {CurveType} from "@zapjs/curve"
import {BigNumber} from 'bignumber.js';
import {address,BNType} from "@zapjs/types"

export type InitProvider  {
  public_key : string,
  title :string,
  from: address,
  gas ?: BNType
}


export type InitCurve = {
  endpoint:string,
  term:CurveType,
  from: address,
  gas ?: BNType
}


export type NextEndpoint = {
  provider:address,
  endpoint: string
}

export type EndpointParams = {
  endpoint:string,
  endpoint_params: string[],
  from: address,
  gas ?: BNType
}

export type SetProviderParams = {
  key: string,
  value: string,
  from: address,
  gas ?: BNType
};