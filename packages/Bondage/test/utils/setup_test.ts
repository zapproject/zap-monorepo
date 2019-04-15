const {utf8ToHex, toWei,toHex} = require("web3-utils");
import {Utils} from "@zapjs/utils";
import {NULL_ADDRESS} from "@zapjs/types"

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
    const tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint,zapProvider.curve.values.map((i:string)=>toHex(i)),NULL_ADDRESS).send(defaultTx);
    //Endpoint with broker address
    await deployedRegistry.contract.methods.initiateProviderCurve(utf8ToHex(Utils.Constants.EndpointBroker),zapProvider.curve.values.map((i:string)=>toHex(i)),accounts[5]).send(defaultTx);

    for (const account of accounts) {
        await deployedToken.contract.methods.allocate(account, toWei("100000000000000")).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS});
    }

    return "done";
}
