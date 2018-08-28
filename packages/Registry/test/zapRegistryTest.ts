import {join} from "path";
const Web3 = require('web3');
const {hexToUtf8,BN,utf8ToHex} = require("web3-utils");
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;

import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {ZapRegistry} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Registry test', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    registryWrapper:any,
    web3,
    testArtifacts,
    testZapProvider = Utils.Constants.testZapProvider,
    buildDir:string = join(__dirname,"contracts"),
    options = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            testArtifacts = Utils.getArtifacts(join(__dirname,"contracts"));
            done();
        });
    });

    after(function(){
        console.log("Done running Registry tests");
        ganacheServer.close();
        process.exit();
    });

    it("should be able to create registryWrapper", async ()=>{
        registryWrapper = new ZapRegistry(options)
    })


    it('Should initiate provider in zap registry contract', async () => {
     let tx =  await registryWrapper.initiateProvider({
        public_key: testZapProvider.pubkey,
        title: testZapProvider.title,
        from: accounts[0],
        gas: 600000
    });
     expect(tx).to.include.keys("events")
     expect(tx.events).to.include.keys("NewProvider")
     expect(tx.events.NewProvider).to.include.keys("returnValues");
     let returnValues = tx.events.NewProvider.returnValues;
     expect(returnValues).to.include.keys("provider","title")
     expect(testZapProvider.title).to.equal(hexToUtf8(returnValues.title))
     expect(returnValues.provider).to.equal(accounts[0]);
     const title = await registryWrapper.getProviderTitle(accounts[0]);
     await expect(title).to.be.equal(testZapProvider.title);
     const pubkey = await registryWrapper.getProviderPublicKey(accounts[0]);
     await expect(pubkey).to.be.equal(testZapProvider.pubkey);
    });

    it('Should initiate Provider curve  with 0x0 broker in zap registry contract', async () => {
        let thisCurve = testZapProvider.curve;
        let tx = await registryWrapper.initiateProviderCurve({
            endpoint: testZapProvider.endpoint,
            term: testZapProvider.curve.values,
            from: accounts[0],
            gas: 3000000
        });
        expect(tx).to.include.keys("events");
        expect(tx.events).to.include.keys("NewCurve");
        expect(tx.events.NewCurve).to.include.keys("returnValues");
        let returnValues = tx.events.NewCurve.returnValues;
        expect(returnValues).to.include.keys("provider","endpoint","curve",'broker')
        expect(returnValues.broker).to.equal(Utils.Constants.NULL_ADDRESS);
        expect(returnValues.provider).to.equal(accounts[0]);
        expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
        const a:string = JSON.stringify(returnValues.curve);
        const b:string = JSON.stringify(testZapProvider.curve.values.map((i:number)=>{return ''+i}));
        expect(a).to.be.equal(b);
    });
    it("Should get all provider params", async()=>{
        let params = await registryWrapper.getAllProviderParams(accounts[0])
        console.log("All params : ",params)
    })

    it('Should initiate Provider curve  with valid broker address in zap registry contract', async () => {
        const providerAddress = accounts[3]
        const brokerAddress = accounts[4]
        const initTx = await registryWrapper.initiateProvider({
            public_key: testZapProvider.pubkey,
            title: testZapProvider.title,
            from: providerAddress,
            gas: 600000
        });
        const initCurveTx = await registryWrapper.initiateProviderCurve({
            endpoint: testZapProvider.endpoint,
            term: testZapProvider.curve.values,
            broker: brokerAddress,
            from: providerAddress,
            gas: 3000000
        });
        expect(initCurveTx).to.include.keys("events");
        expect(initCurveTx.events).to.include.keys("NewCurve");
        expect(initCurveTx.events.NewCurve).to.include.keys("returnValues");
        let returnValues = initCurveTx.events.NewCurve.returnValues;
        expect(returnValues).to.include.keys("provider","endpoint","curve","broker")
        expect(returnValues.provider).to.equal(providerAddress);
        expect(returnValues.broker).to.equal(brokerAddress);
        expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
        const a:string = JSON.stringify(returnValues.curve);
        const b:string = JSON.stringify(testZapProvider.curve.values.map((i:number)=>{return ''+i}));
        expect(a).to.be.equal(b);
    });

    it('Should set endpoint endpointParams in zap registry contract', async () => {
        let result = await registryWrapper.setEndpointParams({
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.endpoint_params,
            from: accounts[0],
            gas: 600000
        });

    });

    after(function () {
        ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
        })
});

