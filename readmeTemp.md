## ZAP.JS
This monorepo repository includes packages that are published to NPM (todo) and managed independently. 

### Packages
[@zapjs/artifacts](/packages/Artifacts) : Contains .json files for mainnet  
[@zapjs/basecontract](/packages/BaseContract) : parent class for all contracts class

[@zapjs/arbiter](/packages/Arbiter) : Manage Subscriptions
 
[@zapjs/bondage](/packages/Bondage) : Help Subscriber bond and unbond

[@zapjs/dispatch](/packages/Dispatch) : Managing queries and responses

[@zapjs/registry](/packages/Registry) : Managing providers registry

[@zapjs/zaptoken](/packages/ZapToken) : Zap Token

[@zapjs/provider](/packages/Provider) : Interacting with contract classes for providers

[@zapjs/subscriber](/packages/Subscriber): Interacting with contract classes for subscribers

[@zapjs/curve](/packages/Curve) : Calculating curve functions

[@zapjs/utils](/packages/Utils): dev tools

##### Development setup with Lerna
- clone the project 
- npm i
- lerna bootstrap --hoist (npm install for all packages)
- lerna run build (run tsc through all packages)
- lerna run test

##### Single Package development
- cd packages/package
- npm run build
- npm run test (tsc and mocha tests)

  




