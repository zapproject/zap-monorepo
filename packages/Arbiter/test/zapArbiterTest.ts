const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
import {BaseContract} from "@zapjs/basecontract"
import {ZapArbiter} from "../src";
const Web3  = require('web3');
import {join} from 'path';

import {Utils} from "@zapjs/utils";

async function configureEnvironment(func:Function) {
  await func();
}

const {utf8ToHex,toBN} = require("web3-utils");

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:any,accounts:Array<string>,deployedRegistry:any, deployedToken:any,deployedBondage:any){
    const dots = 10;
    let normalizedP = Utils.normalizeProvider(zapProvider);
    let defaultTx = {from:accounts[0], gas:Utils.Constants.DEFAULT_GAS};
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey,normalizedP.title, normalizedP.endpoint, normalizedP.endpoint_params).send(defaultTx);
    let convertedCurve = zapProvider.curve.convertToBNArrays();
    let tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint,convertedCurve).send(defaultTx);
    let providerCurve = await deployedRegistry.contract.methods.getProviderCurve(accounts[0],normalizedP.endpoint).call();
    console.log("provider curve", providerCurve);
    console.log("token owner : ", tokenOwner);
    console.log("endpoint: ", normalizedP.endpoint);
    for(let account of accounts) {
        await deployedToken.contract.methods.allocate(account, 1000).send({from: tokenOwner,gas:Utils.Constants.DEFAULT_GAS});
    }
    console.log("Token allocated")
    let requiredZap = await deployedBondage.contract.methods.calcZapForDots(accounts[0], normalizedP.endpoint, toBN(dots)).call();
    console.log("required zap : ", requiredZap);
    console.log("bondage contract address", deployedBondage.contract._address)
    await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from:accounts[2],gas:Utils.Constants.DEFAULT_GAS});
    console.log("Token approved, endpoint : ", normalizedP.endpoint);
    await deployedBondage.contract.methods.bond(accounts[0], normalizedP.endpoint, toBN(dots)).send({from:accounts[2], gas:Utils.Constants.DEFAULT_GAS});
    return "done";
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
  buildDir = join(__dirname,"contracts"),
  testZapProvider = Utils.Constants.testZapProvider;
  options = {
    artifactsDir: buildDir,
    networkId: Utils.Constants.ganacheServerOptions.network_id,
    networkProvider: Utils.Constants.ganacheProvider
  };


  before(function(done) {
    configureEnvironment(async() => {
      ganacheServer = await Utils.startGanacheServer();
      web3 = new Web3(Utils.Constants.ganacheProvider);
      accounts = await web3.eth.getAccounts();
        //delete require.cache[require.resolve('/contracts')];
        await Utils.migrateContracts(buildDir);
        testArtifacts = Utils.getArtifacts(buildDir);
        deployedBondage = new BaseContract(Object.assign(options, {artifactName: "Bondage"}));
        deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "Registry"}));
        deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZapToken"}));
        done()
      });
  });

  after(function(){
    console.log("Done running Arbiter tests");
    ganacheServer.close();
    process.exit();
  });

    it("Should have all pre conditions set up for dispatch to work", async () => {
        const res = await bootstrap(testZapProvider, accounts, deployedRegistry, deployedToken, deployedBondage);
        await expect(res).to.be.equal("done");
    });

    it('Should initiate zapArbiter wrapper', function() {
      arbiterWrapper = new ZapArbiter(options);
    });

  it('2) Should initiate zapArbiter wrapper', function() {
    arbiterWrapper = new ZapArbiter(Object.assign(options, {artifactName:"Arbiter"}));
  });

  it('3) Should initiate subscription', async function() {
    let subscription = await arbiterWrapper.initiateSubscription({
      provider: accounts[0],
      endpoint: testZapProvider.endpoint,
      endpoint_params: testZapProvider.endpoint_params,
      blocks: 4,
      pubkey: Utils.Constants.testZapProvider.pubkey,
      from: accounts[2],
      gas: Utils.Constants.DEFAULT_GAS,
    });
  });
  it("4) Should get subscription", async()=>{
    let subscription = await arbiterWrapper.getSubscription({
      provider:accounts[0],
      subscriber:accounts[2],
      endpoint: Utils.Constants.testZapProvider.endpoint
    })
    expect(subscription).to.have.keys("0","1","2","dots","blockStart","preBlockEnd")
    expect(subscription.dots).to.equal('4')

  })

      //TODO when websocket issue fixed
    // it('Should listen to Data purchase in zapArbiter', async function() {
    //   arbiterWrapper.listen((err:any, res:any) => {
    //      console.log("event listen : ", err,res)
    //      expect(err).to.be.null;
    //      expect(res.event).to.be.equal("DataPurchase")
    //     return;
    //   });
    // });
    it("5) Should allow unscubscription from provider", async ()=>{
      let unsubscription = await arbiterWrapper.endSubscriptionProvider({
        subscriber:accounts[2],
        endpoint : testZapProvider.endpoint,
        from:accounts[0]
      })
      let event = unsubscription.events;

    })
    it("6) Should allow unsubscription from subscriber", async()=>{
      await arbiterWrapper.initiateSubscription({
        provider: accounts[0],
        endpoint: testZapProvider.endpoint,
        endpoint_params: testZapProvider.endpoint_params,
        blocks: 4,
        pubkey: testZapProvider.pubkey,
        from: accounts[2],
        gas: Utils.Constants.DEFAULT_GAS,
      });
      await arbiterWrapper.endSubscriptionSubscriber({
        provider: accounts[0],
        endpoint: testZapProvider.endpoint,
        from:accounts[2]
      })
    })
  });
