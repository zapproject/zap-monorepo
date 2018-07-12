export interface BaseContractType  {
  	artifactsDir ?:string|null,
    artifactName: string,
    networkId?: number|null,
    networkProvider?: any|null,
    contract ?: any
}
 export interface ContractType {
     artifactsDir ?:string|null,
     networkId?: number|null,
     networkProvider?: any|null
 }
