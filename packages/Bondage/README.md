# @zapjs/bondage

This package provides an interface to the Zap bondage contract. This package enables subscribers to bond and unbond Zap and Dots from registered oracles.

### Prerequisites
```
- Node 12.20 <=14.15
- Typescript
```

## Usage
##### Using Zap Arbiter to listen to subscriptions events
```
npm install --save `@zapjs/bondage`
```
```
import {ZapBondage} from '@zapjs/bondage';

let myZapBondage = new ZapBondage();
```

Custom configuration
```
let myZapBondage = new ZapBondage({networkId,networkProvider,coordinator})
```
#### Methods

Get methods
```
const zapBound = await myZapBondage.getZapBound({provider,endpoint});
const dotsBound = await myZapBondage.getBoundDots({subscriber,provider,endpoint});
const gotsIssued = await myZapBondage.getDotsIssued({provider,endpoint});
const currentCostOfDots  = await myZapBondage.currentCostOfDots({provider,ednpoint,dots});
const bondRate = await myZapBondage.calcBondRate({provider,endpoint,zapNum});
const zapRequired = await myZapBondate.calcZapForDots({provider,endpoint,dots});
```

Listen to events
```
myZapBondate.listenBound(filters,callback);
myZapBondate.listenUnbound(filters,callback);
myZapBondate.listenEscrowed(filters,callback);
myZapBondate.listenRelease(filters,callback);
```
Listen to all events
```
myZapBondate.listen(callback);
```

### See more Usages of each packages
* [Provider](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Provider/README.md)
* [Subscriber](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Subscriber/README.md)
* [Registry](https://github.com/zapproject/zap-monorepo/blob/master/packages/Registry/README.md)
* [Dispatch](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Dispatch/README.md)
* [Arbiter](https://github.com/zapproject/Zap-monorepo/tree/master/packages/Arbiter/README.md)
* [ZapToken](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapToken/README.md)
* [Zapjs](https://github.com/zapproject/Zap-monorepo/tree/master/packages/ZapJs/README.md)
