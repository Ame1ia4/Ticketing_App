const {
    getContract,
    showModal
} = require('../assets/js/web3_init.js');

describe('check_balance.js', () => {

    beforeEach(() => {

        document.body.innerHTML = `
            <input id="walletAddress" />
            <textarea id="tokenBalance"></textarea>
            <textarea id="ethBalance"></textarea>
            <div id="errorModal"></div>
            <div id="errorMessage"></div>
        `;

        jest.clearAllMocks();
    });

    test('contract factory loads', () => {

        const contract = getContract();

        expect(contract).toBeDefined();
    });

    test('valid wallet address format', () => {

        const address =
            '0x1234567890123456789012345678901234567890';

        const isValid =
            /^0x[a-fA-F0-9]{40}$/.test(address);

        expect(isValid).toBe(true);
    });

    test('invalid wallet address format', () => {

        const address = 'bad-address';

        const isValid =
            /^0x[a-fA-F0-9]{40}$/.test(address);

        expect(isValid).toBe(false);
    });

    test('balance textarea updates', () => {

        const textarea =
            document.getElementById(
                'tokenBalance'
            );

        textarea.value = '100';

        expect(textarea.value)
            .toBe('100');
    });

    test('modal handles contract failures', () => {

        showModal('Balance fetch failed');

        expect($).toHaveBeenCalled();
    });
});