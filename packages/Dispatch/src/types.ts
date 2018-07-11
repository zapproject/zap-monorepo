import BigNumber from 'bignumber.js';
export type QueryArgs = {
  provider:string,
  endpoint: string,
  query: string,
  params : Array<string>,
  onchainProvider : boolean,
  onchainSubscriber : boolean,
    from:string,
    gas: BigNumber
}

export type ResponseArgs = {
  queryId : string,
  responseParams: Array<string>,
  dynamic : boolean,
  from: string,
    gas:BigNumber
}

export interface FilterType{
  fromBlock ?: number,
    toBlock ?: number,
    provider ?: string

}
