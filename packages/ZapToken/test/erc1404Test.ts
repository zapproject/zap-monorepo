import {Utils} from "@zapjs/utils";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;

import {Erc1404} from "../src"
import {join} from "path";
const Web3 = require('web3');
const BigNumber = require("bignumber.js")

async function configureEnvironment(func:Function) {
    await func();
}

console.log('Erc1404 TEST...');

describe('ZapErc1404, path to "/src/api/contracts/ZapErc1404"', () => {
    let addressZapToken:string,
    accounts:Array<string> = [],
    zapTokenWrapper: Erc1404,
    ganacheServer:any,
    web3:any,
    testArtifacts:any,
    buildDir:string = join(__dirname,"contracts"),
    zapTokenOwner:string;
    const allocateAmount = '1000';


    before(function (done) {
        configureEnvironment(async() => {
            // ganacheServer = await Utils.startGanacheServer();
            console.log('trying ti initiate web3...');
            web3 = new Web3(Web3.providers.HttpProvider("http://127.0.0.1:7545"));

            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            testArtifacts = Utils.getArtifacts(join(__dirname, "contracts"));
            done();
        });
    });

    // //
    // // after(function(){
    // //     console.log("Done running Token tests");
    // //     ganacheServer.close();
    // //     process.exit();
    // // });

    it('Should initiate wrapper', async () => {
        zapTokenWrapper = new Erc1404({
            artifactsDir : buildDir,
            networkId: Utils.Constants.ganacheServerOptions.network_id,
            networkProvider: Utils.Constants.ganacheProvider});
        await Utils.delay(3000)
        expect(zapTokenWrapper).to.be.ok
        zapTokenOwner = await  zapTokenWrapper.getContractOwner()
    });

    it('Should get zapToken owner', async () => {
        const owner = await zapTokenWrapper.getContractOwner();

        await expect(owner).to.be.equal(accounts[0]);
    });

    it('Should get balance of zapToken from wrapper', async () => {
        const balance = await zapTokenWrapper.balanceOf(accounts[0]);
        await expect(balance.valueOf()).to.be.equal('0');
    });

    it('Should get transfer restrictions', async () => {
        const code = await zapTokenWrapper.detectTransferRestriction({
            to: accounts[2],
            amount: allocateAmount,
            from: accounts[0]
        });

        await expect(code).to.be.equal(0);
    });

    it('Should set address to be able to send and receive', async () => {
        const code = await zapTokenWrapper.addToBothSendAndReceiveAllowed(accounts[0], accounts[0]);

        await expect(code).to.be.equal(0);
    });

    it('Should make transfer to another account', async () => {
        await zapTokenWrapper.send({
            to: accounts[2],
            amount: allocateAmount,
            from: accounts[1]
        });
        const balance = await zapTokenWrapper.balanceOf(accounts[2]);

        await expect(balance).to.be.equal(allocateAmount);
    });

    it('Should approve to transfer from one to the another account', async () => {
        await zapTokenWrapper.approve({
            to: accounts[2],
            amount: allocateAmount,
            from: accounts[0]
        });
    });
});
