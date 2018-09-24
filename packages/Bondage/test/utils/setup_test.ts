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
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey.toString(), normalizedP.title).send(defaultTx);
    const convertedCurve = zapProvider.curve.convertToBNArrays();
    const tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint,zapProvider.curve.valuesToString(convertedCurve),"0x0000000000000000000000000000000000000000").send(defaultTx);
    //Endpoint with broker address
    await deployedRegistry.contract.methods.initiateProviderCurve(utf8ToHex(Utils.Constants.EndpointBroker), zapProvider.curve.valuesToString(convertedCurve),accounts[5]).send(defaultTx);
    for (const account of accounts) {
        await deployedToken.contract.methods.allocate(account, Utils.toZapBase(100000000000000).toString()).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS});
    }

    return "done";
}
