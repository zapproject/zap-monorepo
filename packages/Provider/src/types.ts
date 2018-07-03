import {CurveTypes} from "@zap/curve"
export type InitProvider = {
    public_key : string,
    title :string,
    endpoint: string,
    endpoint_params ?: Array<string>,
    gas ?: number
}

export type InitCurve = {
    endpoint:string,
    constants :number[],
    parts: number[],
    dividers: number[],
    gas ?: number
}

export type UnsubscribeListen = {
    subscriber:string,
    terminator : string,
    fromBlock : number
}

export type ListenQuery = {
    queryId: string,
    subscriber :string,
    fromBlock : number
}

export type Respond = {
    queryId:string,
    responseParams : string[],
    dynamic:boolean
}
