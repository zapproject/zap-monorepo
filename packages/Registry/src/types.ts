import {CurveTypes} from "@zap/curve"
export type InitProvider = {
  public_key : string,
  title :string,
  endpoint: string,
  endpoint_params ?: Array<string>,
  from: string,
  gas ?: number
}


export type InitCurve = {
  endpoint:string,
  curve:CurveTypes.Curve,
  from: string,
  gas ?: number
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
  gas ?: number
}
