export type TransferType = {
    to:address,
    amount:number,
    from:address,
    gas ?: number
}

export type address=string;
export type txid= string|object