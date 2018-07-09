export type serverOptionsType = {
    network: string ,
    network_id: number,
    hostname: string,
    port: number,
    gas: number,
    gasPrice: number
}

export type buildOptionsType = {
    logger: any,
    contracts_build_directory: string,
    contracts_directory:string,
    working_directory: string,
    migrations_directory: string,
}
