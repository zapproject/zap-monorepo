import {Utils } from '@zapjs/utils';
const {toHex } = require('web3-utils');

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:any, accounts:Array<string>, zapRegistry:any, zapToken:any){
    const normalizedP = Utils.normalizeProvider(zapProvider);
    const defaultTx = {from: accounts[0], gas: Utils.Constants.DEFAULT_GAS };
    await zapRegistry.contract.methods.initiateProvider(normalizedP.pubkey, normalizedP.title).send(defaultTx);
    const tokenOwner = await zapToken.contract.methods.owner().call();
    console.log('P : ', zapProvider);
    await zapRegistry.initiateProviderCurve({endpoint: zapProvider.endpoint, term: zapProvider.curve.values.map((i:string)=>toHex(i)), broker: zapProvider.broker, from: accounts[0] });
    const providerCurve = await zapRegistry.getProviderCurve(accounts[0], zapProvider.endpoint);
    const endpointBroker = await zapRegistry.getEndpointBroker(accounts[0], normalizedP.endpoint);
    console.log('provider curve', providerCurve);
    console.log('endpoint broker: ', endpointBroker);
    for (const account of accounts) {
        await zapToken.contract.methods.allocate(account, Utils.toZapBase('1000')).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS });
    }
    return 'done';
}
