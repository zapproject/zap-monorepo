/*const expect = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber'))
  .expect;

import * as  Web3 from 'web3';
import {join} from 'path';
import {Bootstrap,
        contractsLoader,
        getDeployedContract,
    startGanacheServer,
    migrateContracts,
        testProvider,
        DEFAULT_GAS
      } from "@zap/utils"
const tokensForOwner =100, tokensForOracle = 100;


async function configureEnvironment(func) {
  await func();
}


describe('Arbiter, path to "/src/api/contracts/ZapArbiter"', () => {
  const bootstrap = new Bootstrap(join(__dirname,"contracts"));
  let accounts = [];
  let deployedZapArbiter;
  let deployedZapToken;
  let deployedZapRegistry;
  let deployedZapBondage;
  let zapArbiterWrapper;
  let Config;
  let web3;
  let Arbiter;
  let testArtifacts;
  let testServer;
  let buildDir = join(__dirname,"contracts")
  before(function(done) {
    configureEnvironment(async() => {
      this.timeout(60000);
      testServer = await startGanacheServer();
      await migrateContracts(join(buildDir));
    });
  });

  describe.only('Arbiter', function() {

    before(function(done){
      configureEnvironment(async() => {
        web3 = new Web3(bootstrap.provider);
        accounts = await web3.eth.getAccounts();
        delete require.cache[require.resolve('/contracts')];
        testArtifacts = contractsLoader(join(__dirname,"contracts"));
        done();
      });

    });
    it('Should get instances of smart contracts, their storages and bind owners', function() {
      try {
        deployedZapToken = getDeployedContract(testArtifacts['ZapToken'], {id:testServer.networkId}, testServer.provider);
        deployedZapRegistry = getDeployedContract(testArtifacts['Registry'], {id:testServer.networkId}, testServer.provider);
        deployedZapBondage = getDeployedContract(testArtifacts['Bondage'],{id:testServer.networkId}, testServer.provider);
        deployedZapArbiter = getDeployedContract(testArtifacts['Arbiter'], {id:testServer.networkId}, testServer.provider);
      } catch (err) {
        throw err;
      }
    });

    it('Should initiate zapArbiter wrapper', function() {
      zapArbiterWrapper = new Arbiter({
          artifactsModule:buildDir,
          networkId: testServer.networkId,
          provider : testServer.provider
      });
    });

    it('Should initiate subscription', async function() {
      accounts = await web3.eth.getAccounts();
      await deployedZapRegistry.initiateProvider(
        testProvider.pubkey,
        testProvider.title,
        testProvider.endpoint,
        testProvider.params,
        { from: accounts[2], gas: DEFAULT_GAS });

      await deployedZapRegistry.initiateProviderCurve(
        testProvider.endpoint,
        testProvider.curve.constants,
        testProvider.curve.parts,
        testProvider.curve.dividers,
        { from: accounts[2], gas: 1000000 });

      await deployedZapToken.allocate(
        accounts[0],
        tokensForOwner,
        { from: accounts[0], gas: DEFAULT_GAS });

      await deployedZapToken.allocate(
        accounts[2],
        tokensForOracle,
        { from: accounts[0], gas: DEFAULT_GAS });

      await deployedZapToken.allocate(
        deployedZapBondage.address,
        tokensForOracle,
        { from: accounts[0], gas: DEFAULT_GAS });

      await deployedZapToken.approve(
        deployedZapBondage.address,
        tokensForOracle,
        { from: accounts[0], gas: DEFAULT_GAS });

      await deployedZapBondage.bond(
        accounts[2],
        oracleEndpoint,
        100,
        { from: accounts[0], gas: DEFAULT_GAS });

      await zapArbiterWrapper.initiateSubscription({
        oracleAddress: accounts[2],
        endpoint: testProvider.endpoint,
        endpointParams: testProvider.params,
        blocks: 4,
        publicKey: testProvider.pubkey,
        from: accounts[0],
        gas: DEFAULT_GAS,
      });
    });
    it('Should listen to Data purchase in zapArbiter', async function() {
      // zapArbiterWrapper = new Arbiter();
      zapArbiterWrapper.listen((err, res) => {
        // console.log("event listen : ", err,res)
        // expect(err).to.be.null;
        // expect(res.event).to.be.equal("DataPurchase")
        return;
      });
    });
  });
});
*/