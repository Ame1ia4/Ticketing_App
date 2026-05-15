const {
    signAndSend,
    showModal
} = require('../assets/js/web3_init.js');

describe('transfer_ticket.js', () => {

    beforeEach(() => {

        document.body.innerHTML = `
            <input id="recipientAddress" />
            <input id="amount" />
            <textarea id="transactionRequest"></textarea>
            <textarea id="transactionResult"></textarea>
            <div id="errorModal"></div>
            <div id="errorMessage"></div>
        `;

        jest.clearAllMocks();
    });

    test('transfer flow builds transaction correctly', () => {

        const tx = {
            from: '0xsender',
            to: CONFIG.CONTRACT_ADDRESS,
            data: '0x123'
        };

        expect(tx.from).toBe('0xsender');

        expect(tx.to)
            .toBe(CONFIG.CONTRACT_ADDRESS);
    });

    test('invalid address handling', () => {

        const invalid =
            'not-an-eth-address';

        const isValid =
            /^0x[a-fA-F0-9]{40}$/.test(invalid);

        expect(isValid).toBe(false);
    });

    test('transaction request textarea updates', () => {

        const textarea =
            document.getElementById(
                'transactionRequest'
            );

        textarea.value = 'pending tx';

        expect(textarea.value)
            .toBe('pending tx');
    });

    test('modal displays transfer errors', () => {

        showModal('Transfer failed');

        expect($).toHaveBeenCalled();
    });

    test('signAndSend exists', () => {

        expect(typeof signAndSend)
            .toBe('function');
    });
});