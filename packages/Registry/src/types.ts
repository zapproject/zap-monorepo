import {CurveType} from "@zap/curve"
import BigNumber from 'bignumber.js';


export type InitProvider = {
  public_key : string,
  title :string,
  endpoint: string,
  endpoint_params ?: Array<string>,
  from: string,
  gas : BigNumber
}


export type InitCurve = {
  endpoint:string,
  curve:CurveType,
  from: string,
  gas : BigNumber
}


export type NextEndpoint = {
  provider:string,
  endpoint: string,
  index:number
}

export type EndpointParams = {
  endpoint:string,
  endpoint_params: string[],
  from: string,
  gas : BigNumber
}
