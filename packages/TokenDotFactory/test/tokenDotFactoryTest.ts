import {join} from "path";
const Web3 = require('web3');
const {hexToUtf8,BN,utf8ToHex, toBN} = require("web3-utils");
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;


import {Filter, txid,address,NetworkProviderOptions,DEFAULT_GAS,NULL_ADDRESS} from "@zapjs/types";
import {Curve} from "@zapjs/curve"
import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {ZapRegistry} from '@zapjs/registry';
import {ZapToken} from '@zapjs/zaptoken';
import {TokenDotFactory} from '../src';
async function configureEnvironment(func:Function) {
    await func();
}

describe('TokenDotFactory test', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    dotWrapper:any,
    web3,
    testArtifacts,
    testProvider = Utils.Constants.testZapProvider,
    buildDir:string = join(__dirname,"contracts"),
    deployedToken: any,
    account: any,
    options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            account = accounts[0];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            testArtifacts = Utils.getArtifacts(join(__dirname,"contracts"));
            await Utils.delay(3000)
            let deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZAP_TOKEN"}));
            let dotWrapper = new BaseContract(Object.assign(options, {artifactName: "TOKENDOTFACTORY"}));
            let tokenOwner = await deployedToken.contract.methods.owner().call();
            await deployedToken.contract.methods.allocate(account, Utils.toZapBase(100000000000000)).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS});
            let bal = await deployedToken.contract.methods.balanceOf(account).call();
            console.log(bal);
            //correct balance
            done();
        });
    });

    // async initializeCurve({ specifier, ticker, term, from, gas=gas}:InitTokenCurve): Promise<txid> {
    it('Should initialize token curve', async () => {

        dotWrapper = await new TokenDotFactory(options)
        await Utils.delay(3000);
        expect(dotWrapper).to.be.ok

        let extraGas =toBN(DEFAULT_GAS).mul(toBN(10));

        let p = {
            specifier: testProvider.endpoint,
            ticker: testProvider.endpoint,
            term: testProvider.curve.values ,
            from: account,
            gas:extraGas
        };

        // let tx = await dotWrapper.contract.methods.initializeCurve(
        //    utf8ToHex(p.specifier),
        //    utf8ToHex(p.ticker),
        //    p.term
        // ).send({from:p.from, gas:p.gas});

        let tx =  await dotWrapper.initializeCurve(p);
        console.log('tx ', tx);

        // let address = await dotWrapper.contract.methods.getTokenAddress(utf8ToHex(p.specifier));
        // console.log('address ', address); 
        // let approveTokens = new toBN("1000e18");
        // deployedToken.contract.methods.approve(dotWrapper.contract.address, approveTokens).send({from:p.from, gas:p.gas});
        // await dotWrapper.contract.bond(utf8ToHex(p.specifier), 1).send({from:p.from, gas:p.gas});

    });

    after(function () {
        ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
    })


});


