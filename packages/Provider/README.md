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
const Curve = await 
```



### See more Usages of each packages :
* [Provider] ()
* [Subscriber] ()
* [Register] ()
* [Bondage] ()
* [Dispatch] ()
* [Arbiter] ()
* [ZapToken] ()


## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/) 
* [Mocha](https://mochajs.org/) 
* [Truffle](https://truffleframework.com/)
* [Ganache] (https://truffleframework.com/ganache)

## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.


See also the list of [contributors](https://github.com/zapproject/Zap-monorepo/graphs/contributors)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


