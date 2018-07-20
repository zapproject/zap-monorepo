# Zap-token

This repository provides Interface to Zap Token contract

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Using ZapToken package for ERC20 methods with Zap Token
```
npm install --save `@zap/zaptoken`
```
```
import {ZaopToken} from '@zap/zaptoken';

let myZapToken = new ZapToken(); 
```

Custom configuration
``` 
let myZapToken = new ZapToken({artifactDir,networkId,networkProvider})
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
* [Register](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Register/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)


## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/) 
* [Mocha](https://mochajs.org/) 
* [Truffle](https://truffleframework.com/)
* [Ganache](https://truffleframework.com/ganache)

