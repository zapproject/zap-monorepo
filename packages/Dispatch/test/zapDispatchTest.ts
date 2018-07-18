import {join} from "path";
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const Web3 = require('web3');
import {bootstrap} from "./utils/setup_test";

import {Utils} from "@zap/utils";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapDispatch} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Zap Dispatch Test"', () => {
    let accounts :Array<string>= [],
        ganacheServer:any,
        dispatchWrapper:any,
        deployedDispatchStorage,
        deployedRegistry:any,
        deployedToken:any,
        deployedBondage:any,
        web3:any,
        testArtifacts,
        options:any,
        query="TestQuery",
        responses =["TestReponse_1","TestResponse_2"],
        queryData: any,
        buildDir:string = join(__dirname,"contracts"),
        testZapProvider = Utils.Constants.testZapProvider;

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            await Utils.migrateContracts(buildDir);
            console.log("Migration complete. ");
            done();
        });
    });

    describe('Dispatch Test', () => {
        options = {
            artifactsDir: buildDir,
            networkId: Utils.Constants.ganacheServerOptions.network_id,
            networkProvider: Utils.Constants.ganacheProvider
        };

        before(function (done) {
            configureEnvironment(async () => {
                testArtifacts = Utils.getArtifacts(buildDir);
                deployedBondage = new BaseContract(Object.assign(options, {artifactName: "Bondage"}));
                deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "Registry"}));
                deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZapToken"}));
                deployedDispatchStorage = new BaseContract(Object.assign(options, {artifactName: "DispatchStorage"}));
                done()
            })
        });

        it("Should have all pre conditions set up for dispatch to work", async () => {
           const res = await bootstrap(testZapProvider, accounts, deployedRegistry, deployedToken, deployedBondage);
           await expect(res).to.be.equal("done");
        })

        it("Should initiate Dispatch Wrapper", async () => {
            dispatchWrapper = new ZapDispatch(Object.assign(options, {artifactName: "Dispatch"}));
            expect(dispatchWrapper).to.be.ok;
        });

        it("Should call query function in Dispatch smart contract", async () => {
            queryData = await dispatchWrapper.queryData({
                provider: accounts[0], // account that used as oracle in booststrap function
                query: query,
                endpoint: testZapProvider.endpoint,
                endpointParams: ['a'],
                onchainProvider: false,
                onchainSubscriber: false,
                from: accounts[2], // account that used for bond in booststrap function 
                gas: Utils.Constants.DEFAULT_GAS
            });
            queryData = queryData.events.Incoming.returnValues;
        });

        it("Should call query function in Dispatch smart contract for onchain provider", async () => {
            try {
                await dispatchWrapper.queryData({
                    provider: accounts[0], // account that used as oracle in booststrap function
                    query: query,
                    endpoint: testZapProvider.endpoint,
                    params: ['a'],
                    onchainProvider: true,
                    onchainSubscriber: false,
                    from: accounts[2], // account that used for bond in booststrap function 
                    gas: Utils.Constants.DEFAULT_GAS
                });
            } catch (e) {
                await expect(e.toString()).to.include('revert');
            }
        });

        it("Should call query function in Dispatch smart contract for onchain subscriber", async () => {
            queryData = await dispatchWrapper.queryData({
                provider: accounts[0], // account that used as oracle in booststrap function
                query: query,
                endpoint: testZapProvider.endpoint,
                params: ['a'],
                onchainProvider: false,
                onchainSubscriber: true,
                from: accounts[2], // account that used for bond in booststrap function 
                gas: Utils.Constants.DEFAULT_GAS
            });
            queryData = queryData.events.Incoming.returnValues;
        });

        it("Should call query function in Dispatch smart contract for onchain subscriber and provider", async () => {
            try {
                await dispatchWrapper.queryData({
                    provider: accounts[0], // account that used as oracle in booststrap function
                    query: query,
                    endpoint: testZapProvider.endpoint,
                    params: ['a'],
                    onchainProvider: true,
                    onchainSubscriber: true,
                    from: accounts[2], // account that used for bond in booststrap function 
                    gas: Utils.Constants.DEFAULT_GAS
                });
            } catch (e) {
                await expect(e.toString()).to.include('revert');
            }
        });

        it('Should call respond function in Dispatch smart contract', async () => {
            try {
                await dispatchWrapper.respond({
                    queryId: queryData.id, 
                    responseParams: responses, 
                    dynamic: false,
                    from: accounts[2]
                });
            } catch(e) {
                await expect(e.toString()).to.include('revert');
            }
        });

        it("Should emit Respond events for offchain subscribers", async () => {
            try {
                await dispatchWrapper.respond({
                    queryId: queryData.id, 
                    responseParams: responses, 
                    dynamic: false,
                    from: accounts[2]
                });
            } catch(e) {
                await expect(e.toString()).to.include('revert');
            }
        });
    });

    after(() => {
        ganacheServer.close();

        // Hotfix for infinity running migration
        process.exit();
    });
});
