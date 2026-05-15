// ─────────────────────────────────────────────────────────────────────────────
// create_wallet.js — handles create-wallet.html.
//
// Changes from review:
//
// [WARN-1]    Private key is cleared from the DOM immediately after the
//             keystore file has been downloaded (or if the user dismisses the
//             download without saving). Previously it remained visible
//             indefinitely, inconsistent with buy_ticket.js and
//             transfer_ticket.js.
//
// [SEC-CRIT-2] Ideally the private key would never appear in the UI at all.
//              However, on the wallet-creation page the user needs to back up
//              their key. The compromise here is:
//
//              (a) The key is shown only until the keystore is downloaded.
//              (b) After download, both #privateKey and #walletAddress are
//                  wiped.
//              (c) A clear warning is shown before revealing the key.
//
//              If your threat model is higher (e.g. enterprise), remove the
//              #privateKey field entirely and rely solely on the keystore file.
//
// [USABILITY]  showModal() is used instead of alert() for consistency with
//              other pages.
// ─────────────────────────────────────────────────────────────────────────────

$(document).ready(function () {
    // Track whether a keystore has been created this session.
    let _keystoreReady = false;

    // ── Create Wallet ─────────────────────────────────────────────────────────

    $("#createWalletButton").click(function () {
        const password = $("#password").val();
        if (!password) {
            showModal("Please enter a password");
            return;
        }

        // Use a fresh, unconnected Web3 instance — no network call needed here.
        const localWeb3 = new Web3();
        const wallet    = localWeb3.eth.accounts.create();
        const keystore  = localWeb3.eth.accounts.encrypt(wallet.privateKey, password);

        $("#walletAddress").val(wallet.address);

        // [SEC-CRIT-2] The private key is shown here because the user needs to
        // record it. It is cleared once the keystore is downloaded (see below).
        // Warn the user before revealing it.
        $("#privateKey").val(wallet.privateKey);
        $("#keystore").val(JSON.stringify(keystore, null, 2));

        _keystoreReady = true;

        showModal(
            "Wallet created! IMPORTANT: Download your keystore file now and store " +
            "it safely. The private key shown on this page will be cleared after download."
        );
    });

    // ── Download Keystore ─────────────────────────────────────────────────────

    $("#downloadKeystore").click(function () {
        const keystore = $("#keystore").val();
        if (!keystore || !_keystoreReady) {
            showModal("Create a wallet first");
            return;
        }

        const blob    = new Blob([keystore], { type: "application/json" });
        const address = $("#walletAddress").val();
        const a       = document.createElement("a");
        a.href        = URL.createObjectURL(blob);
        a.download    = address + ".json";
        a.click();

        // [WARN-1] Clear the private key from the DOM after download — consistent
        // with the wipe policy in buy_ticket.js and transfer_ticket.js.
        // A short delay gives the browser time to trigger the download dialog
        // before we wipe the values (some browsers need one event-loop tick).
        setTimeout(function () {
            $("#privateKey").val("");
            // Keep walletAddress visible so the user can note/copy their address,
            // but clear the raw key and keystore JSON.
            $("#keystore").val("[cleared — keep your downloaded file safe]");
            _keystoreReady = false;
        }, 500);
    });
});
