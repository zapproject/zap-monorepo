declare function toBase(num: number): any;
declare function fromBase(num: number): any;
declare const _default: {
    toHex: (str: string) => string;
    getHexBuffer: (specifier: string) => any;
    getHexString: (str: string) => string;
    fixTruffleContractCompatibilityIssue: (contract: any) => any;
    toBase: typeof toBase;
    fromBase: typeof fromBase;
};
export = _default;
