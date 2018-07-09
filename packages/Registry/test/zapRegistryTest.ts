import {join} from "path";
import * as Web3 from 'web3';
import {hexToUtf8,BN} from "web3-utils";
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
            const params = await registryWrapper.getNextEndpointParams({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                index:0});
            await expect(title).to.be.equal(testZapProvider.params);

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

            let resultConstants = c[0].map((val:BN) => { return val.toNumber() });
            let resultParts = c[1].map((val:BN) => { return val.toNumber() });
            let resultDividers = c[2].map((val:BN) => { return val.toNumber() });

            await expect(resultConstants).to.deep.equal(thisCurve.constants);
            await expect(resultParts).to.deep.equal(thisCurve.parts);
            await expect(resultDividers).to.deep.equal(thisCurve.dividers);
        });

        it('Should set endpoint params in zap registry contract', async () => {
            await registryWrapper.setEndpointParams({
                endpoint: testZapProvider.endpoint,
                params: testZapProvider.params,
                from: accounts[0],
                gas: 300000
            });
            const endpointsSize = await deployedStorage.contract.methods.getEndpointIndexSize.call(accounts[0], testZapProvider.endpoint, { from: accounts[0] });

            await expect(endpointsSize.valueOf()).to.be.equal(testZapProvider.params.length.toString());
        });

        it('Should get oracle in zap registry contract', async () => {
            const oracle = await registryWrapper.getOracle({
                address: accounts[0],
                endpoint: testZapProvider.endpoint.valueOf()
            });

            await expect(oracle.public_key.toNumber()).to.be.equal(testZapProvider.pubkey);
            await expect(oracle.endpoint_params.length).to.be.equal(testZapProvider.params.length);
        });

        after(function () {
            ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
        })
    });
});

