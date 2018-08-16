import {address,BNType} from "@zapjs/types"
export type QueryArgs = {
  provider:address,
  endpoint: string,
  query: string,
  endpointParams : Array<string>,
  from:address,
  gas: BNType
}

export interface ResponseArgs {
  queryId : string,
  responseParams: Array<string | number>,
  dynamic : boolean,
  from: address,
    gas?:BNType
}
