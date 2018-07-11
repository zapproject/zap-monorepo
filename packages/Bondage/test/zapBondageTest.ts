import {join} from "path";

const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const Web3 = require('web3');
import {bootstrap} from "./utils/setup_test";

import {
    migrateContracts,
    startGanacheServer,
    testZapProvider,
    ganacheProvider ,
    ganacheServerOptions,
    getArtifacts
} from "@zap/utils";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapBondage} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Zap Bondage Test"', () => {
    let accounts :Array<string>= [],
        ganacheServer:any,
        bondageWrapper:any,
        deployedBondageStorage,
        deployedRegistry:any,
        deployedToken:any,
        deployedBondage:any,
        web3:any,
        testArtifacts,
        options:any,
        buildDir:string = join(__dirname,"contracts"),
        requiredZap:number;

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await startGanacheServer();
            web3 =new Web3(ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await migrateContracts(buildDir);
            done();
        });
    });

    describe('Bondage Test', () => {
        options = {
            artifactsDir: buildDir,
            networkId: ganacheServerOptions.network_id,
            networkProvider: ganacheProvider
        };
        before(function (done) {
            configureEnvironment(async () => {
                testArtifacts = getArtifacts(buildDir);
                deployedBondage = new BaseContract(Object.assign(options, {artifactName: "Bondage"}));
                deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "Registry"}));
                deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZapToken"}));
                done();
            })
        });
        it("Should have all pre conditions set up for bondage to work", async () => {
            await bootstrap(testZapProvider, accounts, deployedRegistry,deployedBondage, deployedToken);
        })
        it("should initiate Bondage Wrapper", async () => {
            bondageWrapper = new ZapBondage(Object.assign(options, {artifactName: "Dispatch"}));
        });
        it("should have no bound dots for new provider", async()=>{
            let boundDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(boundDots).to.equal(0);
        });
        it('Should get required Zap for 5 dots', async () => {
            requiredZap = await bondageWrapper.calcZapForDots({
                provider:accounts[0],
                endpoint : testZapProvider.endpoint,
                dots:5
            });
            expect(requiredZap).to.equal(110)
        });
        it("Should have calc Bond rate the same with dots",async()=>{
            let calcDots = await bondageWrapper.calcBondRate({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                zapNum: requiredZap
            })
            expect(calcDots).to.equal(5)
        })
        it('Should bond required Zap', async () => {
            let bonded = await bondageWrapper.bond({provider:accounts[0],
            endpoint:testZapProvider.endpoint,zapNum:requiredZap,from:accounts[2]})
            console.log("bonded : ", bonded)
        });
        it("should unbond 1 dots",async()=>{
        });
        it("Should calculate correct current cost of Dots",async ()=>{

        });
        it("Should calculate correct bond rate", async ()=>{

        })

    });
});
