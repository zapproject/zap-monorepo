import {join} from "path";
const Web3 = require('web3');
const {hexToUtf8,BN,utf8ToHex, toBN} = require("web3-utils");
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;
//import {bootstrap} from "./setup_test";
const ganache = require("ganache-cli");


import {Filter, txid,address,NetworkProviderOptions,DEFAULT_GAS,NULL_ADDRESS} from "@zapjs/types";
import {Curve} from "@zapjs/curve"
import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {ZapRegistry} from '@zapjs/registry';
import {ZapToken} from '@zapjs/zaptoken';
import {TokenDotFactory} from '../src';

console.log("23424234324324");

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
    deployedRegistry:any,
    dotWrapper:any,
    account:any,
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
                accounts = await web3.eth.getAccounts();
                account = accounts[0];
                console.log("account: ", account);



                await Utils.migrateContracts(join(__dirname, "contracts"));

                testArtifacts = Utils.getArtifacts(join(__dirname, "contracts"));

                deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
                let tokenOwner = await deployedToken.contract.methods.owner().call();

                let nonce = await web3.eth.getTransactionCount(account);
                console.log("nonce = " + nonce);
                await deployedToken.contract.methods.allocate(account, Utils.toZapBase(100000000000000)).send({
                    from: tokenOwner,
                    gas: Utils.Constants.DEFAULT_GAS,
                   // nonce: nonce
                });
                let bal = await deployedToken.contract.methods.balanceOf(account).call();
                console.log("balance : ", bal);

                nonce = await web3.eth.getTransactionCount(account);
                console.log("nonce = " + nonce);
                dotWrapper = new BaseContract(Object.assign(options, {artifactName: "TOKENDOTFACTORY"}));
                deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "REGISTRY"}));
                let txid = await sendTransaction(account, deployedRegistry.contract.methods.initiateProvider(/*toBN(111).toString()*/111, utf8ToHex("title")));
                console.log("initiate provider ", txid);
                //correct balance

                dotWrapper = await new TokenDotFactory(options);
                await Utils.delay(3000);
                expect(dotWrapper).to.be.ok;


                let p = {
                    specifier: testProvider.endpoint,
                    ticker: testProvider.endpoint,
                    term: testProvider.curve.values ,
                    from: account,
                    gas:2000000,
                };
                console.log(dotWrapper.contract._address);
                let tx = await sendTransaction(account, dotWrapper.contract.methods.initializeCurve(utf8ToHex(p.specifier), utf8ToHex(p.ticker), p.term));
                console.log("init curve from dotwrapper");
                done();
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        });
    });

    // async initializeCurve({ specifier, ticker, term, from, gas=gas}:InitTokenCurve): Promise<txid> {
    it('Should initialize token curve', async () => {

        // dotWrapper = await new TokenDotFactory(options)
        // await Utils.delay(3000);
        // expect(dotWrapper).to.be.ok
        //
        // let extraGas =toBN(DEFAULT_GAS).mul(toBN(10));
        //
        // let p = {
        //     specifier: testProvider.endpoint,
        //     ticker: testProvider.endpoint,
        //     term: testProvider.curve.values ,
        //     from: account,
        //     gas:extraGas
        // };
        // console.log(p)
      //   console.log(dotWrapper.contract.methods.initializeCurve)
      //    let tx = await dotWrapper.contract.methods.initializeCurve(
      //       utf8ToHex(p.specifier),
      //       utf8ToHex(p.ticker),
      //       p.term
      //   ).send({from:p.from, gas:Utils.Constants.DEFAULT_GAS});
      //
      // //let tx =  await dotWrapper.initializeCurve(p);
      //   console.log('tx ', tx);

        // let address = await dotWrapper.contract.methods.getTokenAddress(utf8ToHex(p.specifier));
        // console.log('address ', address);
        // let approveTokens = new toBN("1000e18");
        // deployedToken.contract.methods.approve(dotWrapper.contract.address, approveTokens).send({from:p.from, gas:p.gas});
        // await dotWrapper.contract.bond(utf8ToHex(p.specifier), 1).send({from:p.from, gas:p.gas});

    });

    
});
