const expect = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber'))
  .expect;
import {bootstrap} from "./utils/setup_test";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapArbiter} from "../src";
const Web3  = require('web3');
import {join} from 'path';

import {
    migrateContracts,
    startGanacheServer,
    testZapProvider,
    ganacheProvider ,
    ganacheServerOptions,
    getArtifacts,
    DEFAULT_GAS
} from "@zap/utils";

async function configureEnvironment(func:Function) {
  await func();
}


describe('Arbiter Test', () => {
  let accounts :Array<string> = [],
      deployedToken:any,
      deployedRegistry:any,
      deployedBondage:any,
      arbiterWrapper:any,
      testArtifacts:any,
      ganacheServer:any,
      web3:any,
      options:any,
      buildDir = join(__dirname,"contracts")
  before(function(done) {
    configureEnvironment(async() => {
        ganacheServer = await startGanacheServer();
        web3 = new Web3(ganacheProvider);
        accounts = await web3.eth.getAccounts();
        //delete require.cache[require.resolve('/contracts')];
        await migrateContracts(buildDir);
        done();
    });
  });

  describe.only('Arbiter', function() {
      options = {
          artifactsDir: buildDir,
          networkId: ganacheServerOptions.network_id,
          networkProvider: ganacheProvider
      };
    before(function(done){
      configureEnvironment(async() => {
          testArtifacts = getArtifacts(buildDir);
          deployedBondage = new BaseContract(Object.assign(options, {artifactName: "Bondage"}));
          deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "Registry"}));
          deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZapToken"}));
          done()
      });

    });
    it("Should bootstrap conditions for Zap Arbiter",async ()=>{
       await bootstrap(testZapProvider,accounts,deployedRegistry,deployedToken,deployedBondage);
    });
    it('Should initiate zapArbiter wrapper', function() {
      arbiterWrapper = new ZapArbiter(Object.assign(options,{artifactName:"Arbiter"}));
    });
    it('Should initiate subscription', async function() {
        await arbiterWrapper.initiateSubscription({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.params,
            blocks: 4,
            pubkey: testZapProvider.pubkey,
            from: accounts[2],
            gas: DEFAULT_GAS,
      });
    });
    it('Should listen to Data purchase in zapArbiter', async function() {
      arbiterWrapper.listen((err:any, res:any) => {
         console.log("event listen : ", err,res)
         expect(err).to.be.null;
         expect(res.event).to.be.equal("DataPurchase")
        return;
      });
    });
  });
});
