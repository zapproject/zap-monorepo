# @zapjs/zaptoken

This repository provides an interface tothe  Zap ERC20 token contract. This package enables a Zap holder to check their balance, transfer Zap to other accounts, and delegate transfers (approvals) to other accounts and smart contracts.

### Prerequisites
```
- Node 12.20 <=14.15
- Typescript
```

## Usage
##### Using ZapToken package for ERC20 methods with Zap Token
```
npm install --save `@zapjs/zaptoken`
```
```
import {ZaopToken} from '@zapjs/zaptoken';

let myZapToken = new ZapToken();
```

Custom configuration
```
let myZapToken = new ZapToken({networkId,networkProvider,coordinator})
```

get Zap balance of an addrss
```
const balance = await myZapToken.balanceOf(address);
```
Approve Zap Token to an address
```
await myZapToken.approve({from,to,amount,gas})
//note : from address has to be in web3.eth.accounts
```
Send Zap Token to an address
```
await myZapToken.send({from,to,amount,gas})
//note : from address has to be in web3.eth.accounts
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)



## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/)
* [Mocha](https://mochajs.org/)
* [Truffle](https://truffleframework.com/)
* [Ganache](https://truffleframework.com/ganache)
