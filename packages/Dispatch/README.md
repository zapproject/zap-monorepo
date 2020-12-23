# @zapjs/dispatch

This repository provides an interface to the Zap Dispatch contract, enabling queries to be sent to oracles and responses to be received by subscribers.

### Prerequisites

```
- Node 12.20 <=14.15
- Typescript
```


## Usage
##### Listen to query and response events
```
npm install `@zapjs/dispatch`
```
```
import {ZapDispatch} from '@zapjs/dispatch';
let myZapArbiter = new ZapArbiter();
```
Custom configuration
```
let myZapDispatch = new zapDisPatch({networkId,networkProvider,coordinator})
```
Listen to Incoming query events
```
 myZapDispatch.listenIncoming(filters,callback);
```
Listen to query fulfilling event:
```
 myZapDispatch.listenFulFillQuery(filters,callback);
```

Listen to Offchain response from provider:
```
 myZapDispatch.listenOffchainResponse(filters,callback);
```

Listen to all events
```
myZapDispatch.listen(callback)
```


### See more Usages of each packages
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)
