import {join} from "path";
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
const Web3 = require('web3');
import {bootstrap} from "./utils/setup_test";
const {hexToUtf8} = require("web3-utils");

import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {ZapDispatch} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}



describe('Zap Dispatch Test', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    dispatchWrapper:any,
    deployedRegistry:any,
    deployedToken:any,
    deployedBondage:any,
    coordinator:any,
    web3:any,
    testArtifacts,
    query="TestQuery",
    responses =["TestReponse_1","TestResponse_2"],
    queryData: any,
    buildDir:string = join(__dirname,"contracts"),
    testZapProvider = Utils.Constants.testZapProvider;
    const options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };

    before(function (done) {
        configureEnvironment(async() => {
            // ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            await Utils.migrateContracts(buildDir);
            console.log("Migration complete. ");
            testArtifacts = Utils.getArtifacts(buildDir);
            deployedBondage = new BaseContract(Object.assign(options, {artifactName: "BONDAGE"}));
            deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "REGISTRY"}));
            deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
            await Utils.delay(3000)
            done();
        });
    });

    // after(function(){
    //     console.log("Done running Dispatch tests");
    //     ganacheServer.close();
    //     process.exit();
    // });

    it("Should have all pre conditions set up for dispatch to work", async () => {
     const res = await bootstrap(testZapProvider, accounts, deployedRegistry, deployedToken, deployedBondage);
     await expect(res).to.be.equal("done");
    });

    it("Should initiate Dispatch Wrapper", async () => {
        dispatchWrapper = new ZapDispatch(options);
        await Utils.delay(3000)
        expect(dispatchWrapper).to.be.ok;
    });

    it("Should initiate Dispatch Wrapper with coordinator address", async () => {
        options.coordinator = dispatchWrapper.coordinator._address;
        dispatchWrapper = new ZapDispatch(options);
        await Utils.delay(3000)
        expect(dispatchWrapper).to.be.ok;
    });

    it("Should call query function in Dispatch smart contract", async () => {
        queryData = await dispatchWrapper.queryData({
                provider: accounts[0], // account that used as oracle in booststrap function
                query: query,
                endpoint: testZapProvider.endpoint,
                endpointParams: ['a'],
                from: accounts[2], // account that used for bond in booststrap function
                gas: Utils.Constants.DEFAULT_GAS
            });
        expect(queryData).to.have.any.keys(["events"])
        queryData = queryData.events.Incoming.returnValues;
        expect(queryData).to.have.any.keys(["provider","subscriber","query","endpoint","endpointParams","onchainSubscriber"])
        expect(queryData.provider).to.equal(accounts[0])
        expect(queryData.subscriber).to.equal(accounts[2])
        expect(hexToUtf8(queryData.endpoint)).to.equal(testZapProvider.endpoint)
        expect(queryData.query).to.equal(query)
    });

    it("Should call query function in Dispatch smart contract for onchain provider, which should revert", async () => {
        //let result:any
        try {
            queryData = await dispatchWrapper.queryData({
                provider: accounts[0], // account that used as oracle in booststrap function
                query: query,
                endpoint: testZapProvider.endpoint,
                endpointParams: ['a'],
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
                endpointParams: ['a'],
                from: accounts[2], // account that used for bond in booststrap function
                gas: Utils.Constants.DEFAULT_GAS
            });
        expect(queryData).to.have.any.keys(["events"])
        queryData = queryData.events.Incoming.returnValues;
        expect(queryData).to.have.any.keys(["provider","subscriber","query","endpoint","endpointParams","onchainSubscriber"])
        expect(queryData.provider).to.equal(accounts[0])
        expect(queryData.subscriber).to.equal(accounts[2])
        expect(hexToUtf8(queryData.endpoint)).to.equal(testZapProvider.endpoint)
        expect(queryData.query).to.equal(query)
    });

    it("Should call query function in Dispatch smart contract for onchain subscriber and provider", async () => {
        try {
            await dispatchWrapper.queryData({
                    provider: accounts[0], // account that used as oracle in booststrap function
                    query: query,
                    endpoint: testZapProvider.endpoint,
                    endpointParams: ['a'],
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

    // after(() => {
    //     ganacheServer.close();
    //
    //     // Hotfix for infinity running migration
    //     process.exit();
    // });
});
