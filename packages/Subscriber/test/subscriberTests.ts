import { join } from 'path';
const expect = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber'))
    .expect;
const Web3 = require('web3');
import { bootstrap } from './utils/setup_test';

import {Utils} from '@zapjs/utils';
import { ZapSubscriber } from '../src';
import { ZapBondage } from '@zapjs/bondage';
import { ZapRegistry } from '@zapjs/registry';
import { ZapToken } from '@zapjs/zaptoken';
import { ZapDispatch } from '@zapjs/dispatch';
import { ZapArbiter } from '@zapjs/arbiter';
import {BNType} from '@zapjs/types';

async function configureEnvironment(func: Function) {
    await func();
}

describe('Zap Subscriber Test', () => {
    let accounts: Array<string> = [],
        ganacheServer: any,
        subscriber: ZapSubscriber,
        arbiterWrapper: any,
        dispatchWrapper: any,
        registryWrapper: any,
        tokenWrapper: any,
        bondageWrapper: any,
        deployedToken: any,
        deployedRegistry: any,
        web3: any,
        testArtifacts,
        query = 'TestQuery',
        responses = ['TestReponse_1', 'TestResponse_2'],
        queryData: any,
        buildDir: string = join(__dirname, 'contracts');
    const testZapProvider = Utils.Constants.testZapProvider;
    const options:any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };


    before(function (done) {
        configureEnvironment(async () => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();

            // TODO: fix that migration continue to save artifacts in separate thread
            await Utils.migrateContracts(buildDir);
            console.log('Migration complete. ');
            testArtifacts = Utils.getArtifacts(buildDir);
            bondageWrapper = new ZapBondage(options);
            registryWrapper = new ZapRegistry(options);
            tokenWrapper = new ZapToken(options);
            dispatchWrapper = new ZapDispatch(options);
            arbiterWrapper = new ZapArbiter(options);
            subscriber = new ZapSubscriber(accounts[2], options);
            done();
        });
    });

    after(function(){
        console.log('Done running Subscriber tests');
        ganacheServer.close();
        process.exit();
    });

    it('1. Should have all pre conditions set up for subscriber to work', async () => {
        const res = await bootstrap(testZapProvider, accounts, registryWrapper, tokenWrapper);
        await expect(res).to.be.equal('done');
    });
    it('2. Should bond specified number of zap', async () => {
        const zapRequired:BNType = await bondageWrapper.calcZapForDots({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            dots: 1
        });
        const allowance = await subscriber.getZapAllowance();
        expect(Number(allowance)).to.be.equal(0);
        const approve = await subscriber.approveToBond({provider: accounts[0], zapNum: zapRequired});
        const res = await subscriber.bond({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            dots: 1
        }, (err: any, txid: string) => expect(txid).to.be.a('string'));
        await expect(res.events.Bound.event).to.be.equal('Bound');
    });

    it('3. Should unbond specified number of dots', async () => {
        const res = await subscriber.unBond({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            dots: 1
        }, (err: any, txid: string) => expect(txid).to.be.a('string'));
        await expect(res.events.Unbound.event).to.be.equal('Unbound');
    });

    it('4. Should subscribe to specified provider', async () => {
        const approve = await subscriber.approveToBond({
            provider: accounts[0],
            zapNum: 1000000000
        });
        const bound = await subscriber.bond({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            dots: 2});
        const res = await subscriber.subscribe({
            provider: accounts[0],
            endpoint: testZapProvider.endpoint,
            endpointParams: testZapProvider.endpoint_params,
            dots: 2
        });
    });
});
