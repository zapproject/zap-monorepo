const Web3 = require("web3");
const {utf8ToHex, toBN} = require("web3-utils");
import {Utils} from "@zapjs/utils";

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
    const defaultTx = {from: accounts[0], gas: Utils.Constants.DEFAULT_GAS};
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey, normalizedP.title).send(defaultTx);
    const convertedCurve = zapProvider.curve.convertToBNArrays();
    const tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint, convertedCurve).send(defaultTx);
    const providerCurve = await deployedRegistry.contract.methods.getProviderCurve(accounts[0], normalizedP.endpoint).call();
    let endpointBroker = await deployedRegistry.contract.methods.getEndpointBroker(accounts[0],normalizedP.endpoint).call();
    console.log("provider curve", providerCurve);
    console.log("endpoint broker: ", endpointBroker);
    
    for (const account of accounts) {
        await deployedToken.contract.methods.allocate(account, Utils.toZapBase(100000000000000)).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS});
    }

    return "done";
}
