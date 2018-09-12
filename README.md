# ZAP
ZAP Oracles (introduction here)
# ZAP-Monorepo

This repository provides Interface to Zap contracts and tools to use Zap platform with Javascript projects
Each package is a public npm module that serve developer's needs to intergrate Zap platform

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

### Prerequisites

```
- Nodejs and npm>=6.1.11
- Lerna
- Typescript
```

### Installing

- Installs lerna (used for package bundling) and typescript, as well as all build dependencies.

```
npm install lerna typescript
npm install
```


## Running build and tests

- Packages and installs all dependencies (including @zapjs packages) in the root
  node_modules folder, and compiles all Typescript files.

```
npm run build

```
- Runs mocha unit tests for all packages.

```
npm run test
```            

### Running build and tests for a singular package

- Developing in single package

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
##### Creating a Zap Provider oracle
```
npm install `@zapjs/provider`
```
```
import {ZapProvider, ProviderHandler} from '@zapjs/provider';
let myZapProvider = new ZapProvider({owner:address});
```
**With Custom configuration**
```
let myZapProvider = new ZapProvider({owner:address});
```
**Some example for provider usage**
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

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)


## Built With

* [Lerna](https://lernajs.io/) - The tool to manage monorepo project
* [Typescript](https://www.typescriptlang.org/)
* [Mocha](https://mochajs.org/)
* [Truffle](https://truffleframework.com/)
* [Ganache](https://truffleframework.com/ganache)

## Contributing

Please read [CONTRIBUTING.md]() for details on our code of conduct, and the process for submitting pull requests to us.


See also the list of [contributors](https://github.com/zapproject/Zap-monorepo/graphs/contributors)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
