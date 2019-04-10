import {join} from "path";
const expect = require("chai")
.use(require("chai-as-promised"))
.use(require("chai-bignumber"))
.expect;
const Web3 = require("web3");
const {toHex} = require("web3-utils")

import {BigNumber} from "bignumber.js";

import {BaseContract} from "@zapjs/basecontract";
import {Utils} from "@zapjs/utils";
import {ZapBondage} from "../src";
import {bootstrap} from "./utils/setup_test";

async function configureEnvironment(func: Function) {
    await func();
}

describe('Zap Bondage Test', () => {
    let accounts: string[] = [],
    ganacheServer: any,
    bondageWrapper: any,
    deployedBondageStorage: any,
    deployedRegistry: any,
    deployedToken: any,
    deployedBondage: any,
    web3: any,
    testArtifacts,
    buildDir: string = join(__dirname, "contracts"),
    requiredZap: number,
        testZapProvider = Utils.Constants.testZapProvider;
    const options: any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider,
    };
    let broker:string;
    const endpointB = Utils.Constants.EndpointBroker;


    before(function(done) {
        configureEnvironment(async () => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            broker = accounts[5]
            // delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(buildDir);
            testArtifacts = Utils.getArtifacts(buildDir);
            deployedBondage = new BaseContract(Object.assign(options, {artifactName: "BONDAGE"}));
            deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "REGISTRY"}));
            deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
            await Utils.delay(3000)
            done();
        });
    });

    after(function(){
        console.log("Done running Bondage tests");
        ganacheServer.close();
        process.exit();
    });

    it("1) Should have all pre conditions set up for bondage to work", async () => {
            await bootstrap(testZapProvider, accounts, deployedRegistry, deployedBondage, deployedToken);
        });
    it("2) Should initiate Bondage Wrapper", async () => {
            bondageWrapper = new ZapBondage(options);
            await Utils.delay(3000)
            expect(bondageWrapper).to.be.ok

    });
    it("2) Should initiate Bondage Wrapper through coordinator address", async () => {
        options.coordinator = bondageWrapper.coordinator._address
        bondageWrapper = new ZapBondage(options);
        await Utils.delay(3000);
        expect(bondageWrapper).to.be.ok
    });

    it("3) Should have no bound dots for new provider", async () => {
            const boundDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(boundDots).to.equal('0');
        });

    it("4) Check that total bound zap of unbonded provider is 0", async function() {
            const boundZap = await bondageWrapper.getZapBound({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(boundZap.toString()).to.equal("0");
        });

    it("5) Should calculate the correct amount of Zap for 5 dots", async () => {
            requiredZap = await bondageWrapper.calcZapForDots({
                provider: accounts[0],
                endpoint : testZapProvider.endpoint,
                dots: 5,
            });

            expect(requiredZap).to.equal('85');
        });

    it("7) Should bond (without broker) required Zap to get 5 dots", async () => {
            requiredZap = await bondageWrapper.calcZapForDots({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots:5
                })
            console.log("required zap : ", requiredZap)
            // approve
            await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS});

            const bonded = await bondageWrapper.bond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 5,
                from: accounts[2],
            });
            const numZap = bonded.events.Bound.returnValues.numZap;
            const numDots = bonded.events.Bound.returnValues.numDots;

            let boundDots = await bondageWrapper.getBoundDots({
                subscriber : accounts[2],
                provider: accounts[0],
                endpoint: testZapProvider.endpoint
            })
        console.log("bound dots :", boundDots )
        expect(numZap).to.equal("85");
        expect(numDots).to.equal("5");
        return ;
        });

    it("8) Should bond (with broker) required Zap to get 5 dots", async () => {
        requiredZap = await bondageWrapper.calcZapForDots({
            provider: accounts[0],
            endpoint: endpointB,
            dots:5
        })
        // approve
        await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from: broker, gas: Utils.Constants.DEFAULT_GAS});
        const bonded = await bondageWrapper.bond({
            provider: accounts[0],
            endpoint: endpointB,
            dots: 5,
            from: broker,
        });
        const numZap = bonded.events.Bound.returnValues.numZap;
        const numDots = bonded.events.Bound.returnValues.numDots;

        let boundDots = await bondageWrapper.getBoundDots({
            subscriber : accounts[2],
            provider: accounts[0],
            endpoint: endpointB
        })
        expect(numZap).to.equal("85");
        expect(numDots).to.equal("5");
        return ;
    });


    it("9) Should unbond (without broker) 1 dots and return the right amount of zap", async () => {
            const preAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call().valueOf();

            const unbonded = await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const postAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call();
            const diff = new BigNumber(postAmt).minus(new BigNumber(preAmt)).toString();
            expect(diff).to.equal("35");
        });
    it("9) Should unbond (with broker) 1 dots and return the right amount of zap", async () => {
        const preAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call().valueOf();
        const preAmtBroker = await deployedToken.contract.methods.balanceOf(broker).call().valueOf();

        const unbonded = await bondageWrapper.unbond({
            provider: accounts[0],
            endpoint: endpointB,
            dots: 1,
            from: broker,
        });

        const postAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call();
        const postAmtBroker = await deployedToken.contract.methods.balanceOf(broker).call();
        const diff = new BigNumber(postAmt).minus(new BigNumber(preAmt)).toString();
        const brokerDiff = new BigNumber(postAmtBroker).minus(new BigNumber(preAmtBroker)).toString();
        expect(diff).to.equal("0");
        expect(brokerDiff).to.equal("35");
    });
    it("10) Should fail to unbond endpoint with broker from subscriber", async () => {
            try{
                await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: endpointB,
                dots: 1,
                from: accounts[2],
            });
            }catch(e){
               expect(e).to.deep.equal(`Broker address ${broker} needs to call unbonding for this endpoint`)
            }

    });

    it("11) Check that issued dots will increase with every bond", async () => {
            const startDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});

            await deployedToken.contract.methods.approve(deployedBondage.contract._address, 50).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS});
            const bonded = await bondageWrapper.bond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(1);
        });

    it("12) Check that issued dots will decrease with every unbond", async () => {
            const startDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            const unbonded = await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(-1);
        });

    it("13) Check that you cannot unbond more dots than you have", async () => {
        const startDots:number = await bondageWrapper.getBoundDots({
                subscriber: accounts[2],
                provider: accounts[0],
                endpoint: testZapProvider.endpoint
            });
        try{
            await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 100,
                from: accounts[2],
            });
        }catch(e){
            expect(e.toString()).to.include("revert")
            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots).to.equal(startDots);
        }

        });

    it("14) Check that you can delegateBond", async () => {
            const startDots = await bondageWrapper.getBoundDots({subscriber: accounts[1], provider: accounts[0], endpoint: testZapProvider.endpoint});

            await deployedToken.contract.methods.approve(deployedBondage.contract._address, 50).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS});
            const bonded = await bondageWrapper.delegateBond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                subscriber: accounts[1],
                from: accounts[2]
            });

            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[1], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(1);
    });
    it("15) Should be able to bond more than 10^23 wei zap", async () => {
        let dotsLimit = await bondageWrapper.getDotsLimit({
            provider:accounts[0],
            endpoint:testZapProvider.endpoint
        })
        console.log("dot limit:",dotsLimit)
        let dotsIssued = await bondageWrapper.getDotsIssued({provider:accounts[0],endpoint:testZapProvider.endpoint})
        let availableDots = dotsIssued*1000000
        console.log("availableDots",availableDots)
        let zapForDots:string = await bondageWrapper.calcZapForDots({
            provider:accounts[0],
            endpoint: testZapProvider.endpoint,
            dots : availableDots
        })
        console.log("zap for dots",zapForDots)
        await deployedToken.contract.methods.approve(deployedBondage.contract._address, toHex(zapForDots)).send({from: accounts[3], gas: Utils.Constants.DEFAULT_GAS});
        let bond = await bondageWrapper.bond({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            dots: availableDots,
            from: accounts[3],
        })
        console.log(`zap required for dots limit : ${dotsLimit} , ${zapForDots}`)
    })

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
