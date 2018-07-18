import {join} from "path";
const Web3 = require('web3');
const {hexToUtf8,BN,utf8ToHex} = require("web3-utils");
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;

import {Utils} from "@zap/utils";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapRegistry} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Registry test', () => {
    let accounts :Array<string>= [],
        ganacheServer:any,
        registryWrapper:any,
        deployedStorage:any ,
        web3,
        testArtifacts,
        testZapProvider = Utils.Constants.testZapProvider;
    let buildDir:string = join(__dirname,"contracts");

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            done();
        });
    });

    describe('Registry', function () {
        before(function(done){
            configureEnvironment(async ()=>{
                //delete require.cache[require.resolve(join(__dirname,'contracts'))];
                testArtifacts = Utils.getArtifacts(join(__dirname,"contracts"));
                deployedStorage = new BaseContract({
                        artifactsDir : buildDir,
                        artifactName:"RegistryStorage",
                        networkId: Utils.Constants.ganacheServerOptions.network_id,
                        networkProvider: Utils.Constants.ganacheProvider
                });
                done();
            })
        })
        it("should be able to create registryWrapper", async ()=>{
            registryWrapper = new ZapRegistry({
                artifactsDir : buildDir,
                networkId: Utils.Constants.ganacheServerOptions.network_id,
                networkProvider: Utils.Constants.ganacheProvider,
                artifactName: "Registry"
            })
        })

        it('Should initiate provider in zap registry contract', async () => {
           let tx =  await registryWrapper.initiateProvider({
                public_key: testZapProvider.pubkey,
                title: testZapProvider.title,
                endpoint: testZapProvider.endpoint,
                endpoint_params: testZapProvider.endpoint_params,
                from: accounts[0],
                gas: 600000
            });
            expect(tx).to.include.keys("events")
            expect(tx.events).to.include.keys("NewProvider")
            expect(tx.events.NewProvider).to.include.keys("returnValues");
            let returnValues = tx.events.NewProvider.returnValues;
            expect(returnValues).to.include.keys("provider","title","endpoint")
            expect(testZapProvider.title).to.equal(hexToUtf8(returnValues.title))
            expect(returnValues.provider).to.equal(accounts[0]);
            expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
            const title = await registryWrapper.getProviderTitle(accounts[0]);
            await expect(title).to.be.equal(testZapProvider.title);
            const pubkey = await registryWrapper.getProviderPublicKey(accounts[0]);
            await expect(pubkey).to.be.equal(testZapProvider.pubkey);
            const param1 = await registryWrapper.getNextEndpointParams({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                index:0})
            await expect(param1).to.be.equal(testZapProvider.endpoint_params[0]);
            const param2 = await registryWrapper.getNextEndpointParams({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                index:1})
            await expect(param2).to.be.equal(testZapProvider.endpoint_params[1]);
        });

        it('Should initiate Provider curve in zap registry contract', async () => {
            let thisCurve = testZapProvider.curve;
            let tx = await registryWrapper.initiateProviderCurve({
                endpoint: testZapProvider.endpoint,
                curve: testZapProvider.curve,
                from: accounts[0],
                gas: 3000000
            });
            expect(tx).to.include.keys("events");
            expect(tx.events).to.include.keys("NewCurve");
            expect(tx.events.NewCurve).to.include.keys("returnValues");
            let returnValues = tx.events.NewCurve.returnValues;
            expect(returnValues).to.include.keys("provider","endpoint","constants","parts","dividers")
            expect(returnValues.provider).to.equal(accounts[0]);
            expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
            expect(returnValues.constants).to.deep.equal(testZapProvider.curve.constants.map((i:number)=>{return ''+i}))
            expect(returnValues.parts).to.deep.equal(testZapProvider.curve.parts.map((i:number)=>{return ''+i}))
            expect(returnValues.dividers).to.deep.equal(testZapProvider.curve.dividers.map((i:number)=>{return ''+i}))
            const c = await registryWrapper.getProviderCurve(accounts[0], testZapProvider.endpoint);

            await expect(c.constants).to.deep.equal(thisCurve.constants);
            await expect(c.parts).to.deep.equal(thisCurve.parts);
            await expect(c.dividers).to.deep.equal(thisCurve.dividers);
        });

        it('Should set endpoint endpointParams in zap registry contract', async () => {
            let result = await registryWrapper.setEndpointParams({
                endpoint: testZapProvider.endpoint,
                endpoint_params: testZapProvider.endpoint_params,
                from: accounts[0],
                gas: 600000
            });
            const endpointsSize = await deployedStorage.contract.methods.getEndpointIndexSize(accounts[0], utf8ToHex(testZapProvider.endpoint)).call();
            await expect(parseInt(endpointsSize.valueOf())).to.be.equal(testZapProvider.endpoint_params.length);
        });


        after(function () {
            ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
        })
    });
});

