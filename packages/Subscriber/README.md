# @zapjs/subscriber

This repository provides wrapper classes for data subscribers subscribers to interface with Zap providers.

## Getting Started


### Prerequisites

What things you need to install the software and how to install them

```
- Node 12.20 <=14.15
- Typescript
```

### Installing

```
npm install @zapjs/subscriber
```

## Usage
##### Create a Zap Susbcriber and interact with Provider
```
import {ZapSubscriber} from '@zapjs/subscriber';
let myZapSubscriber = new ZapSubscriber({owner:address})
```
**With Custom configuration**
```
let myZapSubscriber = new myZapSubscriber(owner,{networkId,networkProvider,coordinator});
```
**Methods**
```
await myZapSubscriber.bond({provider, endpoint, zapNum})
await myZapSuscriber.unBond({provider, endpoint, dots})
await myZapSubscriber.subscribe({provider, endpoint, endpointParams, dots})  
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)
