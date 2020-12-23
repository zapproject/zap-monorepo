# Zap-arbiter

This repository provides Interface to Zap Arbiter contract

### Prerequisites
```
- Node 12.20 <=14.15
- Typescript
```

## Usage
##### Using Zap Arbiter to listen to subscriptions events
```
npm install --save `@zapjs/arbiter`
```
```
import {ZapArbiter} from '@zapjs/arbiter';

let myZapArbiter = new ZapArbiter();
```

Custom configuration
```
let myZapArbiter = new ZapArbiter({networkId,networkProvider,coordinator})
```
Listen to new subscription events
```
myZapArbiter.listenSubscriptionStart(filters,allback)
```
Listen to end subscription events
```
myZapArbiter.listenSubscriptionEnd(filters,allback)
```
Get Subscription of provider-subscriber-endpoint
```
await myZapArbiter.getSubscription({provider,subscriber,endpoint})
```
Listen all events
```
myZapArbiter.listen(callback)
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)


## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/)
* [Mocha](https://mochajs.org/)
* [Truffle](https://truffleframework.com/)
* [Ganache](https://truffleframework.com/ganache)
