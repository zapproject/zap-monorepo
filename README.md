## ZAP.JS
This monorepo repository includes packages that are published to NPM (todo) and managed independently. 

### Packages
[@zap/artifacts](/packages/Artifacts) : Contains .json files for mainnet  
[@zap/basecontract](/packages/BaseContract) : parent class for all contracts class

[@zap/arbiter](/packages/Arbiter) : Manage Subscriptions
 
[@zap/bondage](/packages/Bondage) : Help Subscriber bond and unbond

[@zap/dispatch](/packages/Dispatch) : Managing queries and responses

[@zap/registry](/packages/Registry) : Managing providers registry

[@zap/zaptoken](/packages/ZapToken) : Zap Token

[@zap/provider](/packages/Provider) : Interacting with contract classes for providers

[@zap/subscriber](/packages/Subscriber): Interacting with contract classes for subscribers

[@zap/curve](/packages/Curve) : Calculating curve functions

[@zap/utils](/packages/Utils): dev tools

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

  




