// ─────────────────────────────────────────────────────────────────────────────
// transfer_ticket.js — handles the "Transfer Ticket to Vendor" page.
//
// Changes from review:
//
// [SEC-CRIT-2] Private key is NEVER written to the DOM. The wallet returned by
//              loadWalletFromKeystore() is held in the _wallet closure variable
//              and nulled immediately before signAndSend() is invoked.
//
// [SUGGEST-1]  onHash callback used to show the tx hash / Etherscan link as soon
//              as the transaction is broadcast.
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
        loadWalletFromKeystore("#keystoreFile", "#password", function (wallet) {
            _wallet = wallet;

            // Show the public address only — private key stays out of the DOM.
            $("#walletAddress").val(wallet.address);

            showModal("Wallet loaded successfully. Address: " + wallet.address);
        });
    });

    // ── Transfer Ticket ───────────────────────────────────────────────────────

    $("#transferButton").click(function () {
        if (!_wallet) {
            showModal("Please load a wallet first");
            return;
        }

        var tx = {
            from: _wallet.address,
            to:   CONFIG.CONTRACT_ADDRESS,
            // gas and nonce are set dynamically inside signAndSend()
            data: contract.methods.transferBack().encodeABI()
        };

        // Extract private key and immediately null _wallet so the sensitive
        // material is out of the closure scope as early as possible.
        const privateKey = _wallet.privateKey;
        _wallet = null; // [SEC-CRIT-2] Discard before async work begins.

        signAndSend(
            tx,
            privateKey,
            // onSuccess — receipt confirmed
            function (tx, receipt) {
                $("#transactionRequest").val("");
                $("#transactionResult").val(JSON.stringify(receipt, null, 2));
                $("#walletAddress").val(""); // Clear public address
                showModal("Transfer successful! Your ticket has been returned to the vendor.");
            },
            // [SUGGEST-1] onHash — update UI immediately after broadcast
            function (hash) {
                $("#transactionRequest").val(hash);
            }
        );
    });
});
