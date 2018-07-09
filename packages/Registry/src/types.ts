import {CurveTypes} from "@zap/curve"
import {BN} from "web3-utils";
export type InitProvider = {
  public_key : string,
  title :string,
  endpoint: string,
  endpoint_params ?: Array<string>,
  from: string,
  gas : BN
}


export type InitCurve = {
  endpoint:string,
  curve:CurveTypes.Curve,
  from: string,
  gas : BN
}


export type NextEndpoint = {
  provider:string,
  endpoint: string,
  index:number
}

export type EndpointParams = {
  endpoint:string,
  params: string[],
  from: string,
  gas : BN
}
