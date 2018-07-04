const expect = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber'))
  .expect;

const Web3 = require('web3');
import {Bootstrap,
        testContractsLoader,
        getDeployedContract,
        testProvider,
        GAS_LIMIT
      } from "@zap/utils"
let tokensForOwner =100, tokensForOracle = 100;


async function configureEnvironment(func) {
  await func();
}


describe('Arbiter, path to "/src/api/contracts/ZapArbiter"', () => {
  const bootstrap = new Bootstrap(__dirname);
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
  before(function(done) {
    configureEnvironment(async() => {
      this.timeout(60000);
      await bootstrap.migrateContracts();
      done();
    });
  });

  describe.only('Arbiter', function() {

    before(function(done){
      configureEnvironment(async() => {
        web3 = new Web3(bootstrap.provider);
        accounts = await web3.eth.getAccounts();
        delete require.cache[require.resolve('/contracts')];
        testArtifacts = testContractsLoader();
        done();
      });

    });
    it('Should get instances of smart contracts, their storages and bind owners', function() {
      try {
        deployedZapToken = getDeployedContract(testArtifacts['ZapToken'], {id:bootstrap.networkId}, bootstrap.provider);
        deployedZapRegistry = getDeployedContract(testArtifacts['Registry'], {id:bootstrap.networkId}, bootstrap.provider);
        currentCostStorage = getDeployedContract(testArtifacts['CurrentCost'], {id:bootstrap.networkId}, bootstrap.provider);
        deployedZapBondage = getDeployedContract(testArtifacts['Bondage'],{id:bootstrap.networkId}, bootstrap.provider);
        deployedZapArbiter = getDeployedContract(testArtifacts['Arbiter'], {id:bootstrap.networkId}, bootstrap.provider);

        addressZapArbiter = deployedZapArbiter.address;

      } catch (err) {
        throw err;
      }
    });

    it('Should initiate zapArbiter wrapper', function() {
      zapArbiterWrapper = new Arbiter({
          artifactsModule:bootstrap.buildDir,
          networkId: bootstrap.networkId,
          provider : bootstrap.provider
      });
    });

    it('Should initiate subscription', async function() {
      accounts = await web3.eth.getAccounts();
      await deployedZapRegistry.initiateProvider(
        testProvider.pubkey,
        testProvider.title,
        testProvider.endpoint,
        testProvider.params,
        { from: accounts[2], gas: GAS_LIMIT });

      await deployedZapRegistry.initiateProviderCurve(
        testProvider.endpoint,
        testProvider.curve.constants,
        testProvider.curve.parts,
        testProvider.curve.dividers,
        { from: accounts[2], gas: 1000000 });

      await deployedZapToken.allocate(
        accounts[0],
        tokensForOwner,
        { from: accounts[0], gas: GAS_LIMIT });

      await deployedZapToken.allocate(
        accounts[2],
        tokensForOracle,
        { from: accounts[0], gas: GAS_LIMIT });

      await deployedZapToken.allocate(
        deployedZapBondage.address,
        tokensForOracle,
        { from: accounts[0], gas: GAS_LIMIT });

      await deployedZapToken.approve(
        deployedZapBondage.address,
        tokensForOracle,
        { from: accounts[0], gas: GAS_LIMIT });

      await deployedZapBondage.bond(
        accounts[2],
        oracleEndpoint,
        100,
        { from: accounts[0], gas: GAS_LIMIT });

      await zapArbiterWrapper.initiateSubscription({
        oracleAddress: accounts[2],
        endpoint: testProvider.endpoint,
        endpointParams: testProvider.params,
        blocks: 4,
        publicKey: testProvider.pubkey,
        from: accounts[0],
        gas: GAS_LIMIT,
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
