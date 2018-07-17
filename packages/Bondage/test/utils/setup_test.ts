const Web3 = require('web3');
const {utf8ToHex,toBN} = require("web3-utils");
import {normalizeProvider,ZapProviderType,DEFAULT_GAS,toZapBase} from "@zap/utils";

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:ZapProviderType,accounts:Array<string>,deployedRegistry:any, deployedBondage:any,deployedToken:any){
    let normalizedP = normalizeProvider(zapProvider);
    let defaultTx = {from:accounts[0],gas:DEFAULT_GAS}
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey,normalizedP.title, normalizedP.endpoint, normalizedP.endpoint_params).send(defaultTx);
    let convertedCurve = zapProvider.curve.convertToBNArrays();
    let tokenOwner = await deployedToken.contract.methods.owner().call()
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint,convertedCurve[0], convertedCurve[1],convertedCurve[2]).send(defaultTx);
    let providerCurve = await deployedRegistry.contract.methods.getProviderCurve(accounts[0],normalizedP.endpoint).call();
    for(let account of accounts) {
        await deployedToken.contract.methods.allocate(account,toZapBase(1000)).send({from: tokenOwner,gas:DEFAULT_GAS});
    }
    
    return "done";
}
