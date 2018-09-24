import { ZapToken } from "@zapjs/zaptoken";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
import { ZapRegistry } from "@zapjs/registry";
import { ZapBondage } from "@zapjs/bondage";
import { ZapDispatch } from "@zapjs/dispatch";
import { ZapArbiter } from "@zapjs/arbiter";
import { ZapProvider } from "../src";
const Web3 = require('web3');
const { hexToUtf8 } = require("web3-utils");
import { join } from 'path';

import {Utils} from "@zapjs/utils";

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
    testZapProvider = Utils.Constants.testZapProvider,
    DOTS = 10;

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
            providerAddress = accounts[0];
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


    it("1. Should initiate all the required contracts",async ()=>{
     zapToken = new ZapToken(options);
     zapRegistry = new ZapRegistry(options);
     zapBondage = new ZapBondage(options);
     zapDispatch = new ZapDispatch(options);
     zapArbiter = new ZapArbiter(options);
 });
    it("2. Should allocate ZapToken to accounts",async ()=>{
        let zapTokenOwner = await zapToken.getContractOwner()
        for(let account of accounts){
            await zapToken.allocate({to:account,amount:Utils.toZapBase(1000).toString(),from:zapTokenOwner})
        }
    });
    it("3. Should init zapProvider class",async ()=>{
        zapProvider = new ZapProvider(accounts[0],options)
        expect(zapProvider.providerOwner).to.equal(accounts[0])
    })

    it('4. Should initiate provider', async()=> {
     let tx = await zapProvider.initiateProvider({
        public_key:testZapProvider.pubkey,
        title: testZapProvider.title
    })
     expect(tx).to.include.keys("events")
     expect(tx.events).to.include.keys("NewProvider")
     expect(tx.events.NewProvider).to.include.keys("returnValues");
     let returnValues = tx.events.NewProvider.returnValues;
     expect(returnValues).to.include.keys("provider","title");
     expect(testZapProvider.title).to.equal(hexToUtf8(returnValues.title))
     expect(returnValues.provider).to.equal(providerAddress);
 });
    it("5. Should get provider title", async () => {
        let returnedTitle = await zapProvider.getTitle();
        expect(returnedTitle).to.equal(testZapProvider.title)
    });
    it("6. Should get provider pubkey", async () => {
        let returnedPubkey = await zapProvider.getPubkey()
        expect(returnedPubkey).to.equal(testZapProvider.pubkey)
    })
    it('7. Should initiate provider curve', async () => {
        let tx:any;
        console.log(testZapProvider.curve.constants, testZapProvider.curve.parts, testZapProvider.curve.dividers)
        tx = await zapProvider.initiateProviderCurve({
           endpoint: testZapProvider.endpoint,
           term: testZapProvider.curve.values,
           broker: testZapProvider.broker
        });
        expect(tx).to.include.keys("events");
        expect(tx.events).to.include.keys("NewCurve");
        expect(tx.events.NewCurve).to.include.keys("returnValues");
        let returnValues = tx.events.NewCurve.returnValues;
        expect(returnValues).to.include.keys("provider", "endpoint", "curve")
        expect(returnValues.provider).to.equal(providerAddress);
        expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
        expect(returnValues.curve).to.deep.equal(testZapProvider.curve.valuesToString())
    });
    it("8. Should get provider Curve", async () => {
        let returnedCurve = await zapProvider.getCurve(testZapProvider.endpoint)
        const a:string = JSON.stringify(returnedCurve.values);
        const b:string = JSON.stringify(testZapProvider.curve.values);
        expect(a).to.be.equal(b);
    })
    it("9. Should allow and bond subscriber to provider", async () => {
        let zapRequired = await zapProvider.getZapRequired({ endpoint: testZapProvider.endpoint, dots: DOTS })
        let approve = await zapToken.approve({ to: zapBondage.contract._address, amount: zapRequired.toString(), from: subscriberAddress })
        let bond = await zapBondage.bond({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            dots: DOTS,
            from: subscriberAddress
        });
    });
    it("10. Should allow Subscriber to start subscription", async () => {
        let tx = await zapArbiter.initiateSubscription({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.endpoint_params,
            blocks: DOTS,
            pubkey: testZapProvider.pubkey,
            from: subscriberAddress
        })
    });
    it("11. Should have subscription data in arbiter", async () => {
        let res = await zapArbiter.getSubscription({
            provider: providerAddress,
            subscriber: subscriberAddress,
            endpoint: testZapProvider.endpoint,
        });
        await expect(res.dots).to.be.equal(''+DOTS);
    });
    it("12. Should be able to end subscription", async () => {
        await zapArbiter.endSubscriptionProvider({
            subscriber: subscriberAddress,
            endpoint: testZapProvider.endpoint,
            from: providerAddress
        });
    });
    it("13. Should allow subscriber to end subscription", async () => {
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
    it("14. Should receive query from subscriber and Emit event for offchain provider", async () => {
        let zapRequired = await zapProvider.getZapRequired({ endpoint: testZapProvider.endpoint, dots: DOTS })
        let approve = await zapToken.approve({ to: zapBondage.contract._address, amount: zapRequired, from: subscriberAddress })
        let bond = await zapBondage.bond({
            provider: providerAddress,
            endpoint: testZapProvider.endpoint,
            dots: DOTS,
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
    it("15. should receive query and revert for onchain provider without contract implemented", async () => {
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
    it("16. Should respond to onchain subscriber and result in revert for non-implemented contract", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: true,
            from: subscriberAddress
        });
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
    it("17. Should respond to offchain subscriber with respond1", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1'],
            dynamic: false
        });
    });
    it("18. Should respond to offchain subscriber with respond2", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2'],
            dynamic: false
        });
    });
    it("19. Should respond to offchain subscriber with respond3", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2', '3'],
            dynamic: false
        });
    });
    it("20. Should respond to offchain subscriber with respond4", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: ['1', '2', '3', '4'],
            dynamic: false
        });
    });
    it("21. Should respond to offchain subscriber with dynamic responses", async () => {
        const queryResult = await zapDispatch.queryData({
            provider: providerAddress,
            query: testZapProvider.query,
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            onchainProvider: false,
            onchainSubscriber: false,
            from: subscriberAddress
        });
        let queryId = queryResult.events.Incoming.returnValues.id;
        await zapProvider.respond({
            queryId: queryId,
            responseParams: [web3.utils.utf8ToHex('p1')],
            dynamic: true
        });
    });

});
