import {address,BNType, defaultTx} from "@zapjs/types"

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
    queryId : queryIdType
}
export type queryIdType = string|number|BNType

