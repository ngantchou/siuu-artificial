var Web3 = require('web3');
var assert = require('assert');
let infuraString = `.infura.io/f94bc58a280645dba2eff3e86a959b10`

function getNetwork(network) {
    try {
        switch (network) {
            case 'mainnet':
                return setupHttpProvider('https://mainnet' + infuraString);

            case 'rinkeby':
                return setupHttpProvider('https://rinkeby' + infuraString);

            case 'ropsten':
                return setupHttpProvider('https://ropsten' + infuraString);

            default:
                assert.equal(null, new Error(`${network} is not support`));

                return undefined;
        }
    } catch (error) {
        console.error('getNetwork ', error);
        assert.equal(null, error);

        return undefined;
    }
}


function setupHttpProvider(Http) {
    return new Web3.providers.HttpProvider(Http)
}

module.exports = {
    getNetwork
};