global.CONFIG = {

    INFURA_URL:
        'https://sepolia.infura.io/v3/test',

    CONTRACT_ADDRESS:
        '0x1234567890123456789012345678901234567890'
};

global.CONTRACT_ABI = [];

global.window = {

    ethereum: {

        request: jest.fn().mockResolvedValue([
            '0xabc123'
        ])
    }
};

global.document = document;

global.FileReader = class {

    readAsText() {

        this.onload({

            target: {
                result: '{}'
            }
        });
    }
};

global.$ = jest.fn(() => ({

    text: jest.fn().mockReturnThis(),

    append: jest.fn().mockReturnThis(),

    show: jest.fn().mockReturnThis(),

    hide: jest.fn().mockReturnThis(),

    click: jest.fn().mockReturnThis(),

    val: jest.fn(() =>
        'veryStrongPassword123'
    ),

    ready: jest.fn((fn) => fn()),

    attr: jest.fn().mockReturnThis()
}));

global.Web3 = jest.fn(() => ({

    eth: {

        Contract: jest.fn(() => ({
            methods: {}
        })),

        accounts: {

            decrypt: jest.fn(() => ({
                address: '0xabc',
                privateKey: '0xpriv'
            })),

            signTransaction:
                jest.fn()
        },

        estimateGas:
            jest.fn(),

        getTransactionCount:
            jest.fn(),

        sendSignedTransaction:
            jest.fn(() => ({

                on: jest.fn()
                    .mockReturnThis()
            }))
    }
}));