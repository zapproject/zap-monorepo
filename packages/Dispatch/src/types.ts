import BigNumber from 'bignumber.js';
export type address = string;
export type txid = string;
export type QueryArgs = {
  provider:address,
  endpoint: string,
  query: string,
  endpointParams : Array<string>,
  onchainProvider : boolean,
  onchainSubscriber : boolean,
    from:address,
    gas: BigNumber
}

export interface ResponseArgs {
  queryId : string,
  responseParams: Array<string>,
  dynamic : boolean,
  from: address,
    gas?:BigNumber
}

export interface Filter{
  fromBlock ?: number,
    toBlock ?: number,
    provider ?: address

}
