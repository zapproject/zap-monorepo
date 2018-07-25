# @zapjs/dispatch

This repository provides an interface to the Zap Dispatch contract, enabling queries to be sent to oracles and responses to be received by subscribers.

### Prerequisites

```
- Nodejs and npm>=6.1.11 
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
let myZapDispatch = new zapDisPatch({artifactDir,networkId,networkProvider})
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

### See more Usages of each packages :
* [Provider]()
* [Subscriber]()
* [Register]()
* [Bondage]()
* [Arbiter]()
* [ZapToken]()


