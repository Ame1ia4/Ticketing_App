const {
    getContract,
    connectMetaMask,
    loadWalletFromKeystore,
    signAndSend,
    web3
} = require('../assets/js/web3_init.js');

describe('web3_init.js', () => {

    test('creates web3 instance', () => {

        expect(Web3).toHaveBeenCalled();
    });

    test('contract factory exists', () => {

        expect(typeof getContract)
            .toBe('function');
    });

    test('returns contract instance', () => {

        const contract = getContract();

        expect(contract).toBeDefined();
    });

    test('connectMetaMask exists', () => {

        expect(typeof connectMetaMask)
            .toBe('function');
    });

    test('loadWalletFromKeystore exists', () => {

        expect(typeof loadWalletFromKeystore)
            .toBe('function');
    });

    test('signAndSend exists', () => {

        expect(typeof signAndSend)
            .toBe('function');
    });

    test('web3 initialized', () => {

        expect(web3).toBeDefined();
    });
});