import { join } from "path";
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const Web3 = require('web3');
import { bootstrap } from "./utils/setup_test";

import {
    migrateContracts,
    startGanacheServer,
    testZapProvider,
    ganacheProvider,
    ganacheServerOptions,
    getArtifacts,
    DEFAULT_GAS
} from "@zap/utils";
import { Subscriber } from '../src';
import { ZapBondage } from '@zap/bondage';
import { ZapRegistry } from "@zap/registry";
import { ZapToken } from "@zap/zaptoken";
import { ZapDispatch } from "@zap/dispatch";
import { ZapArbiter } from "@zap/arbiter";

async function configureEnvironment(func: Function) {
    await func();
}

describe('Zap Subscriber Test"', () => {
    let accounts: Array<string> = [],
        ganacheServer: any,
        subscriber: Subscriber,
        arbiterWrapper: any,
        dispatchWrapper: any,
        registryWrapper: any,
        tokenWrapper: any,
        bondageWrapper: any,
        deployedToken: any,
        deployedRegistry: any,
        web3: any,
        testArtifacts,
        options: any,
        query = "TestQuery",
        responses = ["TestReponse_1", "TestResponse_2"],
        queryData: any,
        buildDir: string = join(__dirname, "contracts");

    before(function (done) {
        configureEnvironment(async () => {
            ganacheServer = await startGanacheServer();
            web3 = new Web3(ganacheProvider);
            accounts = await web3.eth.getAccounts();

            // TODO: fix that migration continue to save artifacts in separate thread
            await migrateContracts(buildDir);
            console.log("Migration complete. ");
            done();
        });
    });

    describe('Subscriber Test', () => {
        options = {
            artifactsDir: buildDir,
            networkId: ganacheServerOptions.network_id,
            networkProvider: ganacheProvider
        };

        before(function (done) {
            configureEnvironment(async () => {
                testArtifacts = getArtifacts(buildDir);
                bondageWrapper = new ZapBondage({
                    artifactsDir: buildDir,
                    networkId: ganacheServerOptions.network_id,
                    networkProvider: ganacheProvider,
                    artifactName: "Bondage"
                });
                registryWrapper = new ZapRegistry({
                    artifactsDir: buildDir,
                    networkId: ganacheServerOptions.network_id,
                    networkProvider: ganacheProvider,
                    artifactName: "Registry"
                });
                tokenWrapper = new ZapToken({
                    artifactsDir: buildDir,
                    networkId: ganacheServerOptions.network_id,
                    networkProvider: ganacheProvider,
                    artifactName: "ZapToken"
                });
                dispatchWrapper = new ZapDispatch({
                    artifactsDir: buildDir,
                    networkId: ganacheServerOptions.network_id,
                    networkProvider: ganacheProvider,
                    artifactName: "Dispatch"
                });
                arbiterWrapper = new ZapArbiter({
                    artifactsDir: buildDir,
                    networkId: ganacheServerOptions.network_id,
                    networkProvider: ganacheProvider,
                    artifactName: "Arbiter"
                });
                subscriber = new Subscriber({
                    owner: accounts[2],
                    handler: null,
                    zapToken: tokenWrapper,
                    zapRegistry: registryWrapper,
                    zapDispatch: dispatchWrapper,
                    zapBondage: bondageWrapper,
                    zapArbiter: arbiterWrapper
                });
                done()
            })
        });

        it("Should have all pre conditions set up for dispatch to work", async () => {
            const res = await bootstrap(testZapProvider, accounts, deployedRegistry, deployedToken);
            await expect(res).to.be.equal("done");
        })

        it("Should bond specified number of zap", async () => {
            let zapRequired:number = await bondageWrapper.calcZapForDots({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 5
            });        
            const res = await subscriber.bond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                zapNum: zapRequired
            });
            await expect(res.events.Bound.event).to.be.equal('Bound');
        })

        it("Should unbond specified number of dots", async () => {
            const res = await subscriber.unBond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1
            });
            await expect(res.events.Unbound.event).to.be.equal('Unbound');
        })

        it("Should subscribe to specified provider", async () => {
            const res = await subscriber.subscribe({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                endpointParams: testZapProvider.endpoint_params,
                dots: 2
            });
        })


        after(() => {
            ganacheServer.close();

            // Hotfix for infinity running migration
            process.exit();
        });

    });

});
