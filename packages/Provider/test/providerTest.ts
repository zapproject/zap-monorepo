import { ZapToken } from "@zapjs/zaptoken1";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
import { ZapRegistry } from "@zapjs/registry1";
import { ZapBondage } from "@zapjs/bondage1";
import { ZapDispatch } from "@zapjs/dispatch1";
import { ZapArbiter } from "@zapjs/arbiter1";
import { ZapProvider } from "../src";
const Web3 = require('web3');
const { hexToUtf8 } = require("web3-utils");
import { join } from 'path';

import {Utils} from "@zapjs/utils1";

async function configureEnvironment(func: Function) {
    await func();
}


describe('Zap Provider Test', () => {
    let accounts :Array<string> = [],
    zapToken:any,
    zapRegistry:any,
    zapBondage:any,
    zapDispatch:any,
    zapArbiter:any,
    zapProvider:any,
    testArtifacts:any,
    ganacheServer:any,
    web3:any,
    buildDir = join(__dirname,"contracts"),
    providerAddress:string,subscriberAddress:string,
    testZapProvider = Utils.Constants.testZapProvider;

    const options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };

    before(function(done) {
        configureEnvironment(async () => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            providerAddress = accounts[2];
            subscriberAddress = accounts[3]
                //delete require.cache[require.resolve('/contracts')];
                await Utils.migrateContracts(buildDir);
                done();
            });
    });

    after(function(){
        console.log("Done running Provider tests");
        ganacheServer.close();
        process.exit();
    });


    it("Should initiate all the required contracts",async ()=>{
     zapToken = new ZapToken(options);
     zapRegistry = new ZapRegistry(options);
     zapBondage = new ZapBondage(options);
     zapDispatch = new ZapDispatch(options);
     zapArbiter = new ZapArbiter(options);
 });
    it("Should allocate ZapToken to accounts",async ()=>{
        let zapTokenOwner = await zapToken.getContractOwner()
        for(let account of accounts){
            await zapToken.allocate({to:account,amount:Utils.toZapBase(1000),from:zapTokenOwner})
        }
    });
    it("Should init zapProvider class",async ()=>{
        zapProvider = new ZapProvider(accounts[0],options)
        expect(zapProvider.providerOwner).to.equal(accounts[0])
    })

    it('Should initiate provider', async()=> {
     let tx = await zapProvider.initiateProvider({
        public_key:testZapProvider.pubkey,
        endpoint: testZapProvider.endpoint,
        title: testZapProvider.title,
        endpoint_params:testZapProvider.endpoint_params
    })
     expect(tx).to.include.keys("events")
     expect(tx.events).to.include.keys("NewProvider")
     expect(tx.events.NewProvider).to.include.keys("returnValues");
     let returnValues = tx.events.NewProvider.returnValues;
     expect(returnValues).to.include.keys("provider","title","endpoint")
     expect(testZapProvider.title).to.equal(hexToUtf8(returnValues.title))
     expect(returnValues.provider).to.equal(providerAddress);
     expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));

 });
    it("Should get provider title", async () => {
        let returnedTitle = await zapProvider.getTitle();
        expect(returnedTitle).to.equal(testZapProvider.title)
    });
    it("Should get provider pubkey", async () => {
        let returnedPubkey = await zapProvider.getPubkey()
        expect(returnedPubkey).to.equal(testZapProvider.pubkey)
    })
    it('Should initiate provider curve', async () => {
        console.log(testZapProvider.curve.constants, testZapProvider.curve.parts, testZapProvider.curve.dividers)
        let tx = await zapProvider.initiateProviderCurve({
            endpoint: testZapProvider.endpoint,
            constants: testZapProvider.curve.constants,
            parts: testZapProvider.curve.parts,
            dividers: testZapProvider.curve.dividers
        })
        expect(tx).to.include.keys("events");
        expect(tx.events).to.include.keys("NewCurve");
        expect(tx.events.NewCurve).to.include.keys("returnValues");
        let returnValues = tx.events.NewCurve.returnValues;
        expect(returnValues).to.include.keys("provider", "endpoint", "constants", "parts", "dividers")
        expect(returnValues.provider).to.equal(providerAddress);
        expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
        expect(returnValues.constants).to.deep.equal(testZapProvider.curve.constants.map((i: number) => { return '' + i }))
        expect(returnValues.parts).to.deep.equal(testZapProvider.curve.parts.map((i: number) => { return '' + i }))
        expect(returnValues.dividers).to.deep.equal(testZapProvider.curve.dividers.map((i: number) => { return '' + i }))
    });
    it("Should get provider Curve", async () => {
        let returnedCurve = await zapProvider.getCurve(testZapProvider.endpoint)
        expect(returnedCurve).to.deep.equal(testZapProvider.curve)
    })
    it("Should allow and bond subscriber to provider", async () => {
        let zapRequired = await zapProvider.getZapRequired({ endpoint: testZapProvider.endpoint, dots: 10 })
        let approve = await zapToken.approve({ to: zapBondage.contract._address, amount: zapRequired, from: subscriberAddress })
        let bond = await zapBondage.bond({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            zapNum: zapRequired,
            from: subscriberAddress
        });
    });
    it("Should allow Subscriber to start subscription", async () => {
        let tx = await zapArbiter.initiateSubscription({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.endpoint_params,
            blocks: 10,
            pubkey: testZapProvider.pubkey,
            from: subscriberAddress
        })
    });
    it("Should have subscription data in arbiter", async () => {
        let res = await zapArbiter.getSubscription({
            provider: providerAddress,
            subscriber: subscriberAddress,
            endpoint: testZapProvider.endpoint,
        });
        await expect(res.dots).to.be.equal('10');
    });
    it("Should be able to end subscription", async () => {
        await zapArbiter.endSubscriptionProvider({
            subscriber: subscriberAddress,
            endpoint: testZapProvider.endpoint,
            from: providerAddress
        });
    });
    it("Should allow subscriber to end subscription", async () => {
        let tx = await zapArbiter.initiateSubscription({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.endpoint_params,
            blocks: 1,
            pubkey: testZapProvider.pubkey,
            from: subscriberAddress
        })
        await zapArbiter.endSubscriptionSubscriber({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            from: subscriberAddress
        });
    });
    it("Should receive query from subscriber and Emit event for offchain provider", async () => {
        let zapRequired = await zapProvider.getZapRequired({ endpoint: testZapProvider.endpoint, dots: 10 })
        let approve = await zapToken.approve({ to: zapBondage.contract._address, amount: zapRequired, from: subscriberAddress })
        let bond = await zapBondage.bond({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            zapNum: zapRequired,
            from: subscriberAddress
        });
        await zapProvider.listenQueries({ fromBlock: 0 });
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
    });
    it("should receive query and revert for onchain provider without contract implemented", async () => {
        try {
            await zapDispatch.queryData({
                provider: providerAddress,
                query: testZapProvider.query,
                endpoint: testZapProvider.endpoint,
                endpointParams: testZapProvider.endpoint_params,
                onchainProvider: true,
                onchainSubscriber: false,
                from: subscriberAddress
            });
        } catch (e) {
            await expect(e.toString()).to.include('revert');
        }
    });
    it("Should respond to onchain subscriber and result in revert for non-implemented contract", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: true,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        try {
            await zapProvider.respond({
                queryId: queryId,
                responseParams: [web3.utils.utf8ToHex('p1')],
                dynamic: false
            });
        } catch (e) {
            await expect(e.toString()).to.include('revert');
        }
    });
    it("Should respond to offchain subscriber with respond1", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1'],
            dynamic: false
        });
    });
    it("Should respond to offchain subscriber with respond2", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2'],
            dynamic: false
        });
    });
    it("Should respond to offchain subscriber with respond3", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2', '3'],
            dynamic: false
        });
    });
    it("Should respond to offchain subscriber with respond4", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2', '3', '4'],
            dynamic: false
        });
    });
    it("Should respond to offchain subscriber with dynamic responses", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        console.log('Incoming rest values = ', queryResult.events.Incoming.returnValues);
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: [web3.utils.utf8ToHex('p1')],
            dynamic: true
        });
    });

});
