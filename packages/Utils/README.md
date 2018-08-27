# @zapjs/utils

This repository provides utilities used in other @zapjs packages. This includes various pure functions that are used by other Ethereum-interfacing packages.

### Prerequisites

```
- Nodejs and npm>=6.1.11
- Typescript
```

## Usage
```
npm install `@zapjs/utils`
```
Methods available
```
import {Utils} from '@zapjs/utils';
Utils.getHexBuffer(string)
Utils.getHexString(string)
Utils.toZapBase(num)
Utils.fromzapBase(num)
Utils.normalizeProvider(ZapProvider)
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
