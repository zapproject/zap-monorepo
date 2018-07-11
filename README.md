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
- clone 
- npm install
- lerna bootstrap (npm install for all packages)
- lerna exec tsc (run tsc through all packages)
- lerna run <script name>

#####Single Package development
- cd packages/<package>
- lerna bootstrap --scope=<package>
- npm run run_test (tsc and mocha tests)

##### Note : 
- Migrate issue : Since we use Truffle command for migrations directly to the truffle-core module, we cant do fixed Lerna (which normally provide faster development env, but only for development env). So we will always use independent mode, which make `lerna bootstrap` slower.

  




