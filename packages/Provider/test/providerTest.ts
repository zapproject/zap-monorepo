import {ZapToken} from "../../ZapToken/lib/src";

const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
import {ZapRegistry} from "@zap/registry";
import {ZapBondage} from "@zap/bondage";
import {ZapDispatch} from "@zap/dispatch";
import {ZapArbiter} from "@zap/arbiter";
import {ZapProvider} from "../src";
import {ProviderHandler} from "../src/types"
import {providerHandler} from "./utils/setup_test"
const Web3  = require('web3');
const {hexToUtf8} = require("web3-utils");
import {join} from 'path';

import {Utils} from "@zap/utils";

async function configureEnvironment(func:Function) {
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
        options:any,
        thisHandler:any,
        buildDir = join(__dirname,"contracts"),
        providerAddress:string,subscriberAddress:string,
        testZapProvider = Utils.Constants.testZapProvider;

        options = {
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
        it("Should initiate all the required contracts",async ()=>{
           zapToken = new ZapToken(options);
           zapRegistry = new ZapRegistry(options);
           zapBondage = new ZapBondage(options);
           zapDispatch = new ZapDispatch(options);
           zapArbiter = new ZapArbiter(options);
           thisHandler = new providerHandler();
        });
        it("Should allocate ZapToken to accounts",async ()=>{
            let zapTokenOwner = await zapToken.getContractOwner()
            for(let account of accounts){
                await zapToken.allocate({to:account,amount:Utils.toZapBase(1000),from:zapTokenOwner})
            }
        });
        it("Should init zapProvider class",async ()=>{
            zapProvider = new ZapProvider({
                owner:providerAddress,
                handler:thisHandler,
                zapRegistry:zapRegistry,
                zapDispatch:zapDispatch,
                zapBondage:zapBondage,
                zapArbiter:zapArbiter
            })
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
        it("Should get provider title",async()=>{
            let returnedTitle = await zapProvider.getProviderTitle();
            expect(returnedTitle).to.equal(testZapProvider.title)
        });
        it("Should get provider pubkey",async ()=>{
            let returnedPubkey = await zapProvider.getProviderPubkey()
            expect(returnedPubkey).to.equal(testZapProvider.pubkey)
        })
        it('Should initiate provider curve', async()=> {
            console.log(testZapProvider.curve.constants,testZapProvider.curve.parts,testZapProvider.curve.dividers)
            let tx = await zapProvider.initiateProviderCurve({
                endpoint:testZapProvider.endpoint,
                constants: testZapProvider.curve.constants,
                parts: testZapProvider.curve.parts,
                dividers :testZapProvider.curve.dividers
            })
            expect(tx).to.include.keys("events");
            expect(tx.events).to.include.keys("NewCurve");
            expect(tx.events.NewCurve).to.include.keys("returnValues");
            let returnValues = tx.events.NewCurve.returnValues;
            expect(returnValues).to.include.keys("provider","endpoint","constants","parts","dividers")
            expect(returnValues.provider).to.equal(providerAddress);
            expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
            expect(returnValues.constants).to.deep.equal(testZapProvider.curve.constants.map((i:number)=>{return ''+i}))
            expect(returnValues.parts).to.deep.equal(testZapProvider.curve.parts.map((i:number)=>{return ''+i}))
            expect(returnValues.dividers).to.deep.equal(testZapProvider.curve.dividers.map((i:number)=>{return ''+i}))
        });
        it("Should get provider Curve",async()=>{
            let returnedCurve = await zapProvider.getProviderCurve(testZapProvider.endpoint)
            expect(returnedCurve).to.deep.equal(testZapProvider.curve)
        })
        it("Should allow and bond subscriber to provider",async ()=>{
            let zapRequired = await zapProvider.getZapRequired({endpoint:testZapProvider.endpoint,dots:10})
            let bondageOwner = await zapBondage.getContractOwner()
            let approve = await zapToken.approve({to:bondageOwner,amount:zapRequired,from:subscriberAddress})
            let bond = await zapBondage.bond({
                provider:providerAddress,
                endpoint:testZapProvider.endpoint,
                zapNum: zapRequired,
                from:subscriberAddress
            })
        });
        it("Should allow Subscriber to start subscription", async ()=>{
            let tx = await zapArbiter.initiateSubscription( {
                provider:providerAddress,
                endpoint:testZapProvider.endpoint,
                endpoint_params:testZapProvider.endpoint_params,
                blocks:10,
                pubkey:testZapProvider.pubkey,
                from:subscriberAddress} )
        });
        it("Should have subscription data in arbiter", async ()=>{

        });
        it("Should be able to end subscription", async()=>{

        });
        it("Should allow subscriber to end subscription", async ()=>{

        });
        it("Should receive query from subscriber and Emit event for offchain provider",async()=>{

        });
        it("should receive query and revert for onchain provider without contract implemented", async ()=>{

        });
        it("Should respond to onchain subscriber and result in revert for non-implemented contract", async()=>{

        });
        it("Should respond to offchain subscriber with respond1",async()=>{

        });
        it("Should respond to offchain subscriber with respond2",async()=>{

        });
        it("Should respond to offchain subscriber with respond3",async()=>{

        });
        it("Should respond to offchain subscriber with respond4",async()=>{

        });
        it("Should respond to offchain subscriber with dynamic responses",async()=>{

        });

});
