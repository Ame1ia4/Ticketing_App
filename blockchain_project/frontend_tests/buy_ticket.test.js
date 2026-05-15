beforeEach(() => {
    document.body.innerHTML = `
        <button id="buyTokensButton"></button>
        <textarea id="transactionResult"></textarea>
        <div id="errorModal"></div>
        <p id="errorMessage"></p>
    `;
});

describe('buy_ticket', () => {

    test('buy button exists', () => {
        const btn = document.getElementById('buyTokensButton');
        expect(btn).not.toBeNull();
    });
});