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
    dotWrapper:any,
    tokenDotAccount:any,
    providerAccount:any,
    zapProvider:any,
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
                providerAccount = accounts[1]
                console.log("account: ", tokenDotAccount,providerAccount);
                await Utils.migrateContracts(buildDir);

                testArtifacts = Utils.getArtifacts(join(__dirname, "contracts"));

                deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
                Registry = new ZapRegistry(options)
                let tokenOwner = await deployedToken.contract.methods.owner().call();
                await deployedToken.contract.methods.allocate(tokenDotAccount, toWei("100000000000000")).send({
                    from: tokenOwner,
                    gas: Utils.Constants.DEFAULT_GAS,
                });
                let bal = await deployedToken.contract.methods.balanceOf(tokenDotAccount).call();
                console.log("ZAP balance : ", fromWei(bal));
                //check if tokenDotAccount has been initalized
                for(let account of accounts) {
                    console.log("Token dot title : ", account,await Registry.getProviderTitle(account))
                }
                zapProvider = new ZapProvider(providerAccount,options);
                await zapProvider.initiateProvider({public_key:testProvider.pubkey,title:testProvider.title})
                console.log("TITLE:",await zapProvider.getTitle())
                dotWrapper = await new TokenDotFactory(options);
                await Utils.delay(3000);
                expect(dotWrapper).to.be.ok;
                console.log(dotWrapper.contract._address);
                done();
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        });
    });

    // async initializeCurve({ specifier, ticker, term, from, gas=gas}:InitTokenCurve): Promise<txid> {
    it('1. Should initialize token curve', async () => {

         let tx:any = await dotWrapper.initializeTokenCurve({endpoint:testProvider.endpoint, symbol: "testTicker",term:testProvider.curve.values,from:providerAccount})

        console.log('tx ', tx);

        // let address = await dotWrapper.contract.methods.getTokenAddress(utf8ToHex(p.specifier));
        // console.log('address ', address);
        // let approveTokens = new toBN("1000e18");
        // deployedToken.contract.methods.approve(dotWrapper.contract.address, approveTokens).send({from:p.from, gas:p.gas});
        // await dotWrapper.contract.bond(utf8ToHex(p.specifier), 1).send({from:p.from, gas:p.gas});

    });
    it("2. Should be able to bond to tokendot Endpoint",async()=>{

    });
    it("3. Should be able to approve to burn", async()=>{

    });
    it("4. Should be able to unbond from endpoint",async()=>{

    })



});
