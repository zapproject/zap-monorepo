import {join} from "path";
const Web3 = require('web3');
import {ZapRegistry} from "@zapjs/registry"
const {utf8ToHex, toWei, fromWei} = require("web3-utils");
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
const ganache = require("ganache-cli");

import {ZapProvider} from "@zapjs/provider"
import {ZapBondage} from "@zapjs/bondage";
import {Curve} from "@zapjs/curve"
import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {TokenDotFactory} from '../src';


async function configureEnvironment(func:Function) {
    await func();
}

function sendTransaction(from: String, contractMethod: any) {
    return new Promise(function(resolve, reject){
        contractMethod.send({
            from: from,
            gas: 6721975,
            gasPrice: 20000000000
        }, function(err: any, res: any) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

describe('TokenDotFactory test', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    web3,
    testArtifacts,
    testProvider = Utils.Constants.testZapProvider,
    buildDir:string = join(__dirname,"contracts"),
    deployedToken: any,
    Registry:any,
    Bondage:any,
    dotWrapper:any,
    tokenDotAccount:any,
    providerAccount:any,
    zapProvider:any,
        userAccount:any,
     contractAddress:any,
    options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };
    before(function (done) {
        configureEnvironment(async() => {
            try {
                // ganacheServer = await Utils.startGanacheServer();
                console.log("started");
                web3 = new Web3(Utils.Constants.ganacheProvider);
                options.web3 = web3
                accounts = await web3.eth.getAccounts();
                tokenDotAccount = accounts[0];
                providerAccount = accounts[1];
                userAccount = accounts[3]
                console.log("account: ", tokenDotAccount,providerAccount);
                await Utils.migrateContracts(buildDir);

                testArtifacts = Utils.getArtifacts(join(__dirname, "contracts"));
                deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
                Registry = new ZapRegistry(options)
                Bondage = new ZapBondage(options)
                done();
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        });
    });
    it("1. Should init TokenDot class",async ()=>{
        let tokenOwner = await deployedToken.contract.methods.owner().call();
        const ZAP_ALLOCATE = toWei("100000000000000")
        for(let account of accounts) {
            await deployedToken.contract.methods.allocate(account,ZAP_ALLOCATE ).send({
                from: tokenOwner,
                gas: Utils.Constants.DEFAULT_GAS,
            });
        }
        let bal = await deployedToken.contract.methods.balanceOf(tokenDotAccount).call();
        expect(bal).equal(ZAP_ALLOCATE)
        //check if tokenDotAccount has been initalized
        dotWrapper = await new TokenDotFactory(options);
        contractAddress = dotWrapper.contract._address
        await deployedToken.contract.methods.allocate(contractAddress, ZAP_ALLOCATE).send({
            from: tokenOwner,
            gas: Utils.Constants.DEFAULT_GAS,
        });
       let title = await Registry.getProviderTitle(contractAddress)
        expect(title).to.be.ok
        await Utils.delay(3000);
        expect(dotWrapper).to.be.ok;
        expect(dotWrapper.contract._address).to.be.ok
        await Registry.initiateProvider({public_key:111,title:"title",from:providerAccount})
        console.log("TITLE",await Registry.getProviderTitle(providerAccount))

    })

    // async initializeCurve({ specifier, ticker, term, from, gas=gas}:InitTokenCurve): Promise<txid> {
    it('1. Should initialize token curve', async () => {
        try {

            let tx: any = await dotWrapper.initializeTokenCurve({
                endpoint: testProvider.endpoint,
                symbol: testProvider.endpoint,
                term: testProvider.curve.values,
                from: providerAccount
            })
            let address = await dotWrapper.getDotAddress(testProvider.endpoint);
            expect(address).to.be.equal(tokenDotAccount)
            let isInit = await Registry.isProviderInitiated(contractAddress)
            expect(isInit).to.equal(true)
        }catch(e){
            console.error(e)
        }
    });
    it("2. Should be able to bond to tokendot Endpoint",async()=>{
        let approveTokens = toWei("100");
        dotWrapper.approveToBond({from:userAccount, zapNum:approveTokens});
        let tx = await dotWrapper.bondTokenDot({endpoint:testProvider.endpoint,dots:1,from:userAccount})
        expect(tx).to.be.ok
        let boundDots = await Bondage.getBoundDots({provider:contractAddress,subscriber:userAccount,endpoint:testProvider.endpoint})
        expect(boundDots).to.equal(1)
        let dotsBalance = await dotWrapper.getDotTokenBalance({endpoint:testProvider.endpoint,from:userAccount})
        expect(dotsBalance).to.equal(1)
    });
    it("3. Should be able to approve to burn", async()=>{
        let tx = await dotWrapper.approveToBurn({endpoint:testProvider.endpoint,from:userAccount})

    });
    it("4. Should be able to unbond from endpoint",async()=>{
        let tx = await dotWrapper.unbondTokenDot({endpoint:testProvider.endpoint,dots:1,from:userAccount})
        let boundDots = await Bondage.getBoundDots({endpoint:testProvider.endpoint,from:userAccount,provider:contractAddress})
        expect(boundDots).to.equal(0)
        let tokenBalance = await dotWrapper.getDotTokenBalance({endpoint:testProvider,from:userAccount})
        expect(tokenBalance).to.equal(0)
    })



});
