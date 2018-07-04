## ZAP.JS
This monorepo repository includes packages that are published to NPM (todo) and managed independently. 

### Packages
[@zap/artifacts](/packages/Artifacts) : Contains .json files for mainnet  
[@zap/basecontract](/packages/BaseContract) : parent class for all contracts class

[@zap/arbiter](/packages/Arbiter)
 
[@zap/bondage](/packages/Bondage) : Managing bondings

[@zap/dispatch](/packages/Dispatch) : Managing queries and responses

[@zap/registry](/packages/Registry) : Managing providers registry

[@zap/zaptoken](/packages/ZapToken) 

[@zap/provider](/packages/Provider) : Interacting with contract classes for providers

[@zap/subscriber](/packages/Subscriber): Interacting with contract classes for subscribers

[@zap/curve](/packages/Curve) : Calculating curve functions

[@zap/utils](/packages/Utils): developer tools

##### Development setup
- clone 
- npm install
- lerna bootstrap
- lerna exec tsc
- lerna run test (todo)




