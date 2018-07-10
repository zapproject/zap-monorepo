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
    const dots = 10;
    let defaultTx = {from:accounts[0],gas:DEFAULT_GAS}
    await deployedRegistry.methods.initiateProvider(normalizedP).send(defaultTx);
    await deployedRegistry.methods.initiateProviderCurve(accounts[0],zapProvider.curve.convertToBNArrays()).send(defaultTx);
    for(let account of accounts) {
        await deployedToken.methods.allocate(account,1000).send({from:deployedToken.owner.call(),gas:DEFAULT_GAS});
    }
    await deployedToken.methods.approve(deployedBondage._address,100).send({from:accounts[2],gas:DEFAULT_GAS});
    return "done";
}
