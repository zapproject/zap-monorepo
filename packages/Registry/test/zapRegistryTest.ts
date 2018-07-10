import {join} from "path";
import * as Web3 from 'web3';
import {hexToUtf8,BN,utf8ToHex} from "web3-utils";
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;

import {
    migrateContracts,
    clearBuild,
    startGanacheServer,
    testZapProvider,
    ganacheProvider ,
    ganacheServerOptions,
    getArtifacts
} from "@zap/utils";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapRegistry} from '../src/index.js'

async function configureEnvironment(func) {
    await func();
}

describe('Registry test', () => {
    let accounts :Array<string>= [],
        ganacheServer:any,
        addressRegistry,
        abiJSON,
        registryWrapper:BaseContractType,
        deployedStorage ,
        abiJSONStorage,
        web3,
        testArtifacts;
    let buildDir = join(__dirname,"contracts");

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await startGanacheServer();
            web3 =new Web3(ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await migrateContracts(join(__dirname,"contracts"));
            done();
        });
    });

    describe('Registry', function () {
        before(function(done){
            configureEnvironment(async ()=>{
                //delete require.cache[require.resolve(join(__dirname,'contracts'))];
                testArtifacts = getArtifacts(join(__dirname,"contracts"));
                deployedStorage = new BaseContract({
                        artifactsDir : buildDir,
                        artifactName:"RegistryStorage",
                        networkId: ganacheServerOptions.network_id,
                        networkProvider: ganacheProvider
                });
                done();
            })
        })
        it("should be able to create registryWrapper", async ()=>{
            registryWrapper = new ZapRegistry({
                artifactsDir : buildDir,
                networkId: ganacheServerOptions.network_id,
                networkProvider: ganacheProvider
            })
        })

        it('Should initiate provider in zap registry contract', async () => {
            await registryWrapper.initiateProvider({
                public_key: testZapProvider.pubkey,
                title: testZapProvider.title,
                endpoint: testZapProvider.endpoint,
                endpoint_params: testZapProvider.params,
                from: accounts[0],
                gas: 600000
            });
            const title = await registryWrapper.getProviderTitle(accounts[0]);
            await expect(title).to.be.equal(testZapProvider.title);
            const pubkey = await registryWrapper.getProviderPublicKey(accounts[0]);
            await expect(pubkey).to.be.equal(testZapProvider.pubkey);
            const param1 = await registryWrapper.getNextEndpointParams({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                index:0})
            await expect(param1).to.be.equal(testZapProvider.params[0]);
            const param2 = await registryWrapper.getNextEndpointParams({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                index:1})
            await expect(param2).to.be.equal(testZapProvider.params[1]);
        });

        it('Should initiate Provider curve in zap registry contract', async () => {
            let thisCurve = testZapProvider.curve;
            await registryWrapper.initiateProviderCurve({
                endpoint: testZapProvider.endpoint,
                curve: testZapProvider.curve,
                from: accounts[0],
                gas: 3000000
            });
            const c = await registryWrapper.getProviderCurve(accounts[0], testZapProvider.endpoint);

            await expect(c.constants).to.deep.equal(thisCurve.constants);
            await expect(c.parts).to.deep.equal(thisCurve.parts);
            await expect(c.dividers).to.deep.equal(thisCurve.dividers);
        });

        it('Should set endpoint params in zap registry contract', async () => {
            let result = await registryWrapper.setEndpointParams({
                endpoint: testZapProvider.endpoint,
                endpoint_params: testZapProvider.params,
                from: accounts[0],
                gas: 600000
            });
            const endpointsSize = await deployedStorage.contract.methods.getEndpointIndexSize(accounts[0], utf8ToHex(testZapProvider.endpoint)).call();
            await expect(parseInt(endpointsSize.valueOf())).to.be.equal(testZapProvider.params.length);
        });


        after(function () {
            ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
        })
    });
});

