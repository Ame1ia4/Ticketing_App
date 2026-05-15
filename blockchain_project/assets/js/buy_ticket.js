// ─────────────────────────────────────────────────────────────────────────────
// buy_ticket.js — handles the "Load Wallet & Buy Ticket" page.
//
// Changes from review:
//
// [SEC-CRIT-2] Private key is NEVER written to the DOM. The wallet object
//              returned by loadWalletFromKeystore() is stored in a local
//              closure variable (_wallet) and nulled after use. The #privateKey
//              textarea should be removed from the HTML — if it exists only for
//              debugging, remove it before deploying to production.
//
// [SUGGEST-1]  signAndSend()'s optional onHash callback is used here to update
//              #transactionRequest with the hash immediately after broadcast,
//              so the user gets an Etherscan link without waiting for the receipt.
//
// All other improvements (estimateGas, nonce, error handling) are in
// web3_init.js and apply automatically.
// ─────────────────────────────────────────────────────────────────────────────

$(document).ready(function () {
    const contract = getContract();

    // [SEC-CRIT-2] Wallet lives here in a JS closure — never in the DOM.
    let _wallet = null;

    // ── Load Wallet ───────────────────────────────────────────────────────────

    $("#loadWalletButton").click(function () {
        loadWalletFromKeystore("#keystoreFile", "#password", function (wallet, keystoreString) {
            _wallet = wallet;

            $("#walletAddress").val(wallet.address);
            $("#keystore").val(keystoreString);
            showModal("Wallet loaded successfully. Address: " + wallet.address);
        });
    });

    // ── Buy Tokens ────────────────────────────────────────────────────────────

    $("#buyTokensButton").click(function () {
        _wallet = _wallet || null; // Ensure _wallet is defined in this scope.
        if (!_wallet) {
            showModal("Please load a wallet first");
            return;
        }

        // Validate amount before building the transaction.
        var amount = $("#amountToPay").val();
        if (!amount || parseFloat(amount) <= 0) {
            showModal("Please enter a valid ETH amount to pay");
            return;
        }

        var tx = {
            from:  _wallet.address,
            to:    CONFIG.CONTRACT_ADDRESS,
            // gas and nonce are set dynamically inside signAndSend()
            data:  contract.methods.buyToken().encodeABI(),
            value: web3.utils.toWei(amount, 'ether')
        };

        // Capture the private key into a local const so we can null _wallet
        // immediately after signAndSend is called (defence-in-depth: the key
        // stays in signAndSend's call stack only, not in the outer closure).
        const privateKey = _wallet.privateKey;
        _wallet = null; // [SEC-CRIT-2] Discard as early as possible.

        signAndSend(
            tx,
            privateKey,
            // onSuccess — receipt confirmed
            function (tx, receipt) {
                $("#transactionResult").val(JSON.stringify(receipt, null, 2));
                $("#walletAddress").val(""); // Clear public address too
                showModal("Transaction successful! Token(s) transferred to your wallet.");
            },
            // [SUGGEST-1] onHash — show tx hash immediately after broadcast
            function (hash) {
                $("#transactionRequest").val(hash);
            }
        );
    });
});
