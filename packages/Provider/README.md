# ZAP-Provider

This repository provides Interface for Oracle dev to build Zap Provider

### Prerequisites

What things you need to install the software and how to install them

```
- Nodejs and npm>=6.1.11
- Typescript
```


## Usage
##### Create and manage a Zap Provider
```
npm install `@zap/provider`
```
Create handler for query and subscription requests
```
import {ZapProvider, ProviderHandler} from '@zap/provider';

class myHandler implements ProviderHander{
    handleIncoming(res:any){
    }

    handleSubscription(res:any) {
    }

    handleUnsubscription (res:string){
    }
}
```
Create Zap Provider
- Without handler
```
let myZapProvider = new zapProvider({owner})
```
- With handler
```
let myZapProvider = new ZapProvider({owner:address,handler:new myHandler()})
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
* [Subscriber]()
* [Register]()
* [Bondage]()
* [Dispatch]()
* [Arbiter]()
* [ZapToken]()

