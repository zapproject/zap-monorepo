import { join } from "path";
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
const Web3 = require('web3');
import { bootstrap } from "./utils/setup_test";

import {Utils} from "@zapjs/utils1";
import { ZapSubscriber } from '../src';
import { ZapBondage } from '@zapjs/bondage1';
import { ZapRegistry } from "@zapjs/registry1";
import { ZapToken } from "@zapjs/zaptoken1";
import { ZapDispatch } from "@zapjs/dispatch1";
import { ZapArbiter } from "@zapjs/arbiter1";

async function configureEnvironment(func: Function) {
    await func();
}

describe('Zap Subscriber Test', () => {
    let accounts: Array<string> = [],
    ganacheServer: any,
    subscriber: ZapSubscriber,
    arbiterWrapper: any,
    dispatchWrapper: any,
    registryWrapper: any,
    tokenWrapper: any,
    bondageWrapper: any,
    deployedToken: any,
    deployedRegistry: any,
    web3: any,
    testArtifacts,
    query = "TestQuery",
    responses = ["TestReponse_1", "TestResponse_2"],
    queryData: any,
    buildDir: string = join(__dirname, "contracts"),
    testZapProvider = Utils.Constants.testZapProvider;
    const options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };


    before(function (done) {
        configureEnvironment(async () => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();

            // TODO: fix that migration continue to save artifacts in separate thread
            await Utils.migrateContracts(buildDir);
            console.log("Migration complete. ");
            testArtifacts = Utils.getArtifacts(buildDir);
            bondageWrapper = new ZapBondage(options);
            registryWrapper = new ZapRegistry(options);
            tokenWrapper = new ZapToken(options);
            dispatchWrapper = new ZapDispatch(options);
            arbiterWrapper = new ZapArbiter(options);
            subscriber = new ZapSubscriber(accounts[2],options);
            done();
        });
    });

    after(function(){
        console.log("Done running Subscriber tests");
        ganacheServer.close();
        process.exit();
    });

        it("Should have all pre conditions set up for subscriber to work", async () => {
            const res = await bootstrap(testZapProvider, accounts, registryWrapper, tokenWrapper);
            await expect(res).to.be.equal("done");
        })

        it("Should bond specified number of zap", async () => {
            let zapRequired:number = await bondageWrapper.calcZapForDots({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 5
            });
            const approve = await subscriber.approveToBond(accounts[0],zapRequired)
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
            const approve = await subscriber.approveToBond(accounts[0],100)
            const res = await subscriber.subscribe({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                endpointParams: testZapProvider.endpoint_params,
                dots: 2
            });
        });

    it("Should subscribe to specified provider", async () => {
        await subscriber.subscribe({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            dots: 2
        });

    });
});
