# @zapjs/provider

This package provides wrapper classes to onchain and offchains oracles on the Zap platform. 

### Prerequisites

What things you need to install the software and how to install them

```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Create and manage a Zap Provider
```
npm install `@zapjs/provider`
```
```
import {ZapProvider, ProviderHandler} from '@zapjs/provider';
let myZapProvider = new ZapProvider({owner:address});
```
**Create Zap Provider**
```
let myZapProvider = new zapProvider({owner})
```
**With Custom configuration**
```
let myZapProvider = new ZapProvider({owner,zapRegistry,zapDispatch,zapBondage,zapArbiter});
```


Initiate in Registry and create Curve for an endpoint
```
await myZapProvider.initiateProvider({
    public_key:111,
    title: "testTitle",
    endpoint: "testEndpoint",
    endpoint_params : ["p1","p2"]
})

const thisConstants = []
const thisParts = []
const thisDividers = []
await myZapProvider.initiateProviderCurve({
    endpoint :"testEndpoint",
    constants : thisConstants,
    parts : thisParts,
    dividers : thisDividers
})
```

#### Get information about a provider

Get general information
```
const title = await myZapProvider.getTitle()
const pubkey = await myZapProvider.getPubkey()
TODO get next endpoint
```
Get endpoint specific information
```
const Curve = await myZapProvider.getCurve(endpoint);
const zapBound = await myZapProvider.getZapBoung(endpoint);
const zapRequired = await myZapProvider.getZapRequired({endpoint,dots});
const dots = await myZapProvider.calcDotsForZap({endpoint,zapAmount})
```
Listen to events belong to this provider
```
myZapProvider.listenSubscribes(filters,callback);
myZapProvider.listenUnsubscribes(filters,callback);
myZapProvider.listenQueries(filters,callback);
```
Respond to queries
```
await myZapProvider.respond({queryId,responseParams,dynamic}); //string, array, boolean
```



### See more Usages of each packages :
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Register](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Register/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)


