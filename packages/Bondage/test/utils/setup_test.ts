import {utf8ToHex, toWei, toHex } from 'web3-utils';
import {Utils } from '@zapjs/utils';
import {NULL_ADDRESS } from '@zapjs/types';

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider: any, accounts: string[], deployedRegistry: any, deployedBondage: any, deployedToken: any) {
    const normalizedP = Utils.normalizeProvider(zapProvider);
    const defaultTx = {from: accounts[0],gas:200000 };
    console.log('init provier: ', normalizedP)
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey, normalizedP.title).send(defaultTx,console.error);
    console.log('init provider completed')
    const tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint, zapProvider.curve.values.map((i:string)=>toHex(i)), NULL_ADDRESS).send(defaultTx);
    console.log('init provider curve completed')
    //Endpoint with broker address
    await deployedRegistry.contract.methods.initiateProviderCurve(utf8ToHex(Utils.Constants.EndpointBroker), zapProvider.curve.values.map((i:string)=>toHex(i)), accounts[5]).send(defaultTx);
    console.log('init endpoint with broker address completed')

    for (const account of accounts) {
        await deployedToken.contract.methods.allocate(account, toWei('100000000000000')).send({from: tokenOwner ,gas:150000});
    }
    console.log('balance', await deployedToken.contract.methods.balanceOf(accounts[2]).call())
}
