# ZAP-Subscriber

This repository provides methods for subscribers to interact with Zap Providers and other contracts
## Getting Started


### Prerequisites

What things you need to install the software and how to install them

```
- Nodejs and npm>=6.1.11
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
let myZapSubscriber = new myZapSubscriber({owner,zapRegistry,zapDispatch,zapBondage,zapArbiter});
```
**Methods**
```
await myZapSubscriber.bond({provider, endpoint, zapNum})
await myZapSuscriber.unBond({provider, endpoint, dots})
await myZapSubscriber.subscribe({provider, endpoint, endpointParams, dots})  
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Register](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Register/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)

