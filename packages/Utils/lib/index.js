"use strict";
var Web3 = require('web3');
var web3 = new Web3();
var toHex = function (str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return "0x" + hex;
};
var getHexBuffer = function (specifier) { return new Buffer(specifier, 'hex'); };
var getHexString = function (str) {
    var data = new Buffer(str);
    console.log(data.byteLength);
    var hex = data.toString('hex');
    return "0x" + hex;
};
var fixTruffleContractCompatibilityIssue = function (contract) {
    if (!contract.currentProvider.sendAsync || typeof contract.currentProvider.sendAsync !== 'function') {
        contract.currentProvider.sendAsync = function () {
            return contract.currentProvider.send.apply(contract.currentProvider, arguments);
        };
    }
    return contract;
};
function toBase(num) {
    return web3.utils.toBN(num).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
}
function fromBase(num) {
    return web3.utils.toBN(num).div(web3.utils.toBN(10).pow(web3.utils.toBN(18))).toNumber();
}
module.exports = {
    toHex: toHex,
    getHexBuffer: getHexBuffer,
    getHexString: getHexString,
    fixTruffleContractCompatibilityIssue: fixTruffleContractCompatibilityIssue,
    toBase: toBase,
    fromBase: fromBase,
};
//# sourceMappingURL=index.js.map