import {join} from "path";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
const Web3 = require('web3');
const BigNumber = require('big-number');

import {bootstrap} from "./utils/setup_test";

import {Utils} from "@zap/utils";
import {BaseContract,BaseContractType} from "@zap/basecontract"
import {ZapBondage} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Zap Bondage Test"', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    bondageWrapper:any,
    deployedBondageStorage:any,
    deployedRegistry:any,
    deployedToken:any,
    deployedBondage:any,
    web3:any,
    testArtifacts,
    options:any,
    buildDir:string = join(__dirname,"contracts"),
    requiredZap:number,
        testZapProvider = Utils.Constants.testZapProvider;

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 =new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(buildDir);
            done();
        });
    });

    describe('Bondage Test', () => {
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
                done();
            })
        });
        it("1) Should have all pre conditions set up for bondage to work", async () => {
            await bootstrap(testZapProvider, accounts, deployedRegistry,deployedBondage, deployedToken);
        })
        it("2) Should initiate Bondage Wrapper", async () => {
            bondageWrapper = new ZapBondage(Object.assign(options, {artifactName: "Bondage"}));
        });
        it("3) Should have no bound dots for new provider", async()=>{
            let boundDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(boundDots).to.equal(0);
        });

        it("4) Check that total bound zap of unbonded provider is 0", async function () {
            let boundZap = await bondageWrapper.getZapBound({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(boundZap.toString()).to.equal('0');
        });

        it('5) Should calculate the correct amount of Zap for 5 dots', async () => {
            requiredZap = await bondageWrapper.calcZapForDots({
                provider:accounts[0],
                endpoint : testZapProvider.endpoint,
                dots:5
            });
            expect(requiredZap).to.equal(110)
        });
        it("6) calcBondRate should return the 5 dots for that amount of Zap",async()=>{
            let calcDots = await bondageWrapper.calcBondRate({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                zapNum: requiredZap
            })
            expect(calcDots).to.equal(5)
        });

        it('7) Should bond required Zap to get 5 dots', async () => {
            let approval = await deployedToken.contract.methods.allowance(accounts[2],deployedBondage.contract._address).call().valueOf();

            // approve
            await deployedToken.contract.methods.approve(deployedBondage.contract._address,requiredZap).send({from:accounts[2],gas:Utils.Constants.DEFAULT_GAS});
            
            let bonded = await bondageWrapper.bond({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                zapNum:requiredZap,
                from:accounts[2]
            })
            //console.log("bonded : ", bonded)
            let numZap = bonded['events']['Bound']['returnValues']['numZap'];
            let numDots = bonded['events']['Bound']['returnValues']['numDots'];

            expect(numZap).to.equal('110');
            expect(numDots).to.equal('5');
        });

        it("8) Should unbond 1 dots and return the right amount of zap",async()=>{
            let preAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call().valueOf();

            let unbonded = await bondageWrapper.unbond({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                dots:1,
                from:accounts[2]
            });

            let postAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call();
            let diff = new BigNumber(postAmt).minus(new BigNumber(preAmt)).toString();
            expect(diff).to.equal('50');
        });

        it("9) Should calculate the correct cost for another dot",async ()=>{
            let calcDots = await bondageWrapper.calcBondRate({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                zapNum: 50
            })

            expect(calcDots).to.equal(1);
        });

        it("10) Check that issued dots will increase with every bond", async() => {
            let startDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});

            await deployedToken.contract.methods.approve(deployedBondage.contract._address,50).send({from:accounts[2],gas:Utils.Constants.DEFAULT_GAS});
            let bonded = await bondageWrapper.bond({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                zapNum:50,
                from:accounts[2]
            });

            let finalDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(1);
        });

        it("11) Check that issued dots will decrease with every unbond", async() => {
            let startDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            let unbonded = await bondageWrapper.unbond({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                dots:1,
                from:accounts[2]
            });

            let finalDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(-1);
        });

        it("12) Check that you cannot unbond more dots than you have", async() => {
            let startDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            let unbonded = await bondageWrapper.unbond({
                provider:accounts[0],
                endpoint:testZapProvider.endpoint,
                dots:100,
                from:accounts[2]
            });

            let finalDots = await bondageWrapper.getBoundDots({subscriber:accounts[2],provider:accounts[0],endpoint:testZapProvider.endpoint});
            expect(finalDots).to.equal(startDots);
        });

        /* Can't figure out how to get this working
        it("13) Check that bonding without approval will fail", async() => {
            let allowance = await deployedToken.contract.methods.allowance(accounts[2],deployedBondage.contract._address).call().valueOf();
            if(allowance > 0) await deployedToken.contract.methods.decreaseApproval(deployedBondage.contract, allowance, {from: accounts[2]});

            // will revert
            await expect(function(){
                bondageWrapper.bond({
                    provider:accounts[0],
                    endpoint:testZapProvider.endpoint,
                    zapNum:100,
                    from:accounts[2]
                });
            }).to.throw(Error);
        });
        */

    });
});
