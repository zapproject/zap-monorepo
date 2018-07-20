# Zap-registry

This repository provides Interface to Zap Registry contract

### Prerequisites
```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
##### Using Zap Arbiter to listen to subscriptions events
```
npm install --save `@zap/registry`
```
```
import {ZapRegistry} from '@zap/registry';

let myZapRegistry = new ZapRegistry(); 
```

Custom configuration
``` 
let myZapRegistry = new ZapRegistry({artifactDir,networkId,networkProvider})
```
#### Methods
Get methods
```
myZapRegistry.getNextProvider(index);

```
Listen to events
```
myZapRegistry.listenNewProvider(filters,callback)
myZapRegistry.listenNewCurve(filters,callback)
```
Listen all events
```
myZapRegistry.listen(callback)
```

### See more Usages of each packages :
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Bondage](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Bondage/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)

