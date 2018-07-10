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
        buildDir:string = join(__dirname,"contracts");

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await startGanacheServer();
            web3 =new Web3(ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await migrateContracts(join(__dirname,"contracts"));
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
            })
        });
        it("Should have all pre conditions set up for dispatch to work", async () => {
            await bootstrap(testZapProvider, accounts, deployedRegistry, deployedToken);
        })
        it("should initiate Bondage Wrapper", async () => {
            bondageWrapper = new ZapDispatch(Object.assign(options, {artifactName: "Dispatch"}));
        });
        it('Should call query function in Dispatch smart contract', async () => {

        });

        it('Should call respond function in Dispatch smart contract', async () => {

        });
        it("Should emit Respond events for offchain subscribers",async()=>{

        });

    });
});
