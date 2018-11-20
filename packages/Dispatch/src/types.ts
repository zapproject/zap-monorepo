import {address,BNType, defaultTx,NumType} from "@zapjs/types"

export interface QueryArgs extends defaultTx{
  provider:address,
  endpoint: string,
  query: string,
  endpointParams : Array<string>
}

export interface ResponseArgs extends defaultTx{
  queryId : string,
  responseParams: Array<string | number>,
  dynamic : boolean
}

export interface cancelQuery extends defaultTx{
    queryId : NumType
}

