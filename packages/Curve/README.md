# @zapjs/curve

This package contains objects that can parse the custom Zap bonding curve encoding used by Zap oracles. This package also enables calculations of Dot prices on a given bonding curve.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

### Prerequisites

What things you need to install the software and how to install them

```
- Nodejs and npm>=6.1.11
- Lerna 
- Typescript
```

### Installing


```
npm install -g lerna typescript
npm i
```

- Bootstrap lerna with --hoist option

```
lerna bootstrap --hoist
```


## Running build and tests

- Running build for all packages

```
lerna run build
```

- Running mocha unit tests for all packages

```
lerna run test
```            

### Running build and tests for a package

- Develop in single package

```
cd packages/{package_name}
npm run build
npm run test
```

- Running build and test 

```
npm run run_test
```
## Packages


## Usage
##### Create a Zap Provider
```
npm install `@zapjs/provider`
```
```
import {ZapProvider, ProviderHandler} from '@zapjs/provider';

class myHandler implements ProviderHander{
    handleIncoming(res:any){
    }

    handleSubscription(res:any) {
    }

    handleUnsubscription (res:string){
    }
}
```
```
let myZapProvider = new ZapProvider({owner:address,handler:new myHandler()})


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


