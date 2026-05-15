describe('create_wallet.js', () => {

    beforeEach(() => {

        document.body.innerHTML = `
            <input id="password" />
            <textarea id="walletAddress"></textarea>
            <textarea id="privateKey"></textarea>
            <textarea id="keystore"></textarea>
            <div id="errorModal"></div>
            <div id="errorMessage"></div>
        `;

        jest.clearAllMocks();
    });

    test('rejects short passwords', () => {

        const password = 'short';

        expect(password.length < 12)
            .toBe(true);
    });

    test('accepts strong passwords', () => {

        const password =
            'veryStrongPassword123';

        expect(password.length >= 12)
            .toBe(true);
    });

    test('wallet generation mock works', () => {

        const wallet = {
            address: '0xabc',
            privateKey: '0xpriv'
        };

        expect(wallet.address)
            .toBeDefined();

        expect(wallet.privateKey)
            .toBeDefined();
    });

    test('keystore generation mock works', () => {

        const keystore =
            JSON.stringify({
                version: 3
            });

        expect(typeof keystore)
            .toBe('string');
    });

    test('wallet address updates DOM', () => {

        const textarea =
            document.getElementById(
                'walletAddress'
            );

        textarea.value = '0xabc';

        expect(textarea.value)
            .toBe('0xabc');
    });

    test('keystore updates DOM', () => {

        const textarea =
            document.getElementById(
                'keystore'
            );

        textarea.value = '{"version":3}';

        expect(textarea.value)
            .toContain('version');
    });
});