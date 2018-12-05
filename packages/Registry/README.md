# @zapjs/registry

This repository provides an interface to the Zap Registry contract, enabling data providers (oracles) to register their endpoints and bonding curves. Furthermore, this package enables data subscribers to discover oracles and receive configuration data (such as titles, endpoints, and parameters) from the Registry smart contract.

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Using Zap Arbiter to listen to subscriptions events
```
npm install --save `@zapjs/registry`
```
```
import {ZapRegistry} from '@zapjs/registry';

let myZapRegistry = new ZapRegistry(); 
```

Custom configuration
``` 
let myZapRegistry = new ZapRegistry({networkId,networkProvider,coordinator})
```
#### Methods
Get methods
```
myZapRegistry.getNextProvider(index);

```
Listen to events
```
myZapRegistry.listenNewProvider(filters,callback)
myZapRegistry.listenNewCurve(filters,callback)
```
Listen all events
```
myZapRegistry.listen(callback)
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)


