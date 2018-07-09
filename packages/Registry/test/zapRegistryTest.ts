import {join} from "path";
import * as Web3 from 'web3';
import {hexToUtf8,BN} from "web3-utils";
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;

import { migrateContracts,
    clearBuild,
    startGanacheServer,
    testZapProvider,
    ganacheProvider ,
    ganacheServerOptions,
    contractsLoader
} from "zap/utils";
import {BaseContractType} from "@zap/basecontract"
import {ZapRegistry} from '../src'

async function configureEnvironment(func) {
    await func();
}

describe('Registry test"', () => {
    let accounts :Array<string>= [];
    let addressRegistry;
    let abiJSON;
    let registryWrapper:BaseContractType;
    let deployedStorage;
    let abiJSONStorage;
    let web3;
    let testArtifacts;
    let buildDir = join(__dirname,"contracts");

    before(function (done) {
        configureEnvironment(async() => {
            web3 =new Web3(ganacheProvider);
            accounts = await web3.eth.getAccounts();
            delete require.cache[require.resolve('/contracts')];
            testArtifacts = contractsLoader(join(__dirname,"contracts"));
            done();
        });
    });

    describe('Registry', function () {
        it("should be able to create registryWrapper", async ()=>{
            registryWrapper = new ZapRegistry({
                artifactsDir : buildDir,
                id: ganacheServerOptions.id,
                provider: ganacheProvider
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
            let registryInstance = await registryWrapper.contractInstance();
            const title = hexToUtf8(await registryInstance.getProviderTitle(accounts[0]));

            await expect(title).to.be.equal(testZapProvider.title);
        });

        it('Should initiate Provider curve in zap registry contract', async () => {
            let thisCurve = testZapProvider.curve;
            await registryWrapper.initiateProviderCurve({
                endpoint: testZapProvider.endpoint,
                curve: testZapProvider.curve,
                from: accounts[0],
                gas: 3000000
            });
            let registryInstance = await registryWrapper.contractInstance();
            const c = await registryInstance.getProviderCurve(accounts[0], testZapProvider.endpoint);

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
            const endpointsSize = await deployedStorage.getEndpointIndexSize.call(accounts[0], testZapProvider.endpoint, { from: accounts[0] });

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

