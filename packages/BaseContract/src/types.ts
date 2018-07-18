export interface BaseContractType  {
  	artifactsDir ?:string|undefined,
    artifactName: string,
    networkId?: number|undefined,
    networkProvider?: any|undefined,
    contract ?: any
}
 export interface ContractType {
     artifactsDir ?:string|undefined,
     networkId?: number|undefined,
     networkProvider?: any|undefined
 }
