# Zap-arbiter

This repository provides Interface to Zap Arbiter contract

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Using Zap Arbiter to listen to subscriptions events
```
npm install --save `@zap/arbiter`
```
```
import {ZapArbiter} from '@zap/arbiter';

let myZapArbiter = new ZapArbiter(); 
```

Custom configuration
``` 
let myZapArbiter = new ZapArbiter({artifactDir,networkId,networkProvider})
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
* [Provider]()
* [Subscriber]()
* [Register]()
* [Bondage]()
* [Dispatch]()
* [ZapToken]()


## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/) 
* [Mocha](https://mochajs.org/) 
* [Truffle](https://truffleframework.com/)
* [Ganache](https://truffleframework.com/ganache)

