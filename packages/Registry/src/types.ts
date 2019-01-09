import {CurveType} from "@zapjs/curve"
import {address,BNType, defaultTx} from "@zapjs/types"

export const NULL_ADDRESS= '0x0000000000000000000000000000000000000000';

export interface InitProvider extends defaultTx{
  public_key : string,
  title :string
}


export interface InitCurve extends defaultTx{
  endpoint:string,
  term:CurveType,
  broker?: address|undefined
}


export type NextEndpoint = {
  provider:address,
  endpoint: string
}

export interface EndpointParams extends defaultTx{
  endpoint:string,
  endpoint_params: string[]
}

export interface SetProviderParams extends defaultTx {
  key: string,
  value: string
};

export interface SetProviderTitle extends defaultTx{
    from:address,
    title:string
}

export interface Endpoint extends defaultTx{
    endpoint:string
}
