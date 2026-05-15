
// ─────────────────────────────────────────────────────────────────────────────
// web3_init.js
// Corrected provider initialization + MetaMask support
// ─────────────────────────────────────────────────────────────────────────────

let web3;

// ── Provider Initialisation ─────────────────────────────────────────────────

if (typeof window.ethereum !== "undefined") {

    // MetaMask / injected wallet
    web3 = new Web3(window.ethereum);

    console.log("Using MetaMask provider");

} else {

    // Fallback read-only Infura provider
    web3 = new Web3(CONFIG.INFURA_URL);

    console.log("Using Infura fallback provider");
}

// Sepolia explorer
const EXPLORER_BASE = "https://sepolia.etherscan.io";

// ── Decrypt lockout ──────────────────────────────────────────────────────────

let failedDecryptAttempts = 0;
let decryptLockUntil = 0;

const MAX_DECRYPT_ATTEMPTS = 5;
const DECRYPT_LOCK_MS = 60 * 1000;

// ── Contract helper ──────────────────────────────────────────────────────────

function getContract() {

    return new web3.eth.Contract(
        CONTRACT_ABI,
        CONFIG.CONTRACT_ADDRESS
    );
}

// ── MetaMask connect ─────────────────────────────────────────────────────────

async function connectMetaMask() {

    if (!window.ethereum) {
        showModal("MetaMask is not installed.");
        return null;
    }

    try {

        const accounts =
            await window.ethereum.request({
                method: "eth_requestAccounts"
            });

        return accounts[0];

    } catch (err) {

        showModal(
            "MetaMask connection rejected: "
            + err.message
        );

        return null;
    }
}

// ── Modal helpers ────────────────────────────────────────────────────────────

function showModal(message, linkHref, linkText) {

    $("#errorMessage").text(message);

    if (linkHref) {

        const anchor = $("<a>")
            .attr("href", linkHref)
            .attr("target", "_blank")
            .attr("rel", "noopener noreferrer")
            .text(linkText || "View on Etherscan");

        $("#errorMessage")
            .append(" ")
            .append(anchor);
    }

    $("#errorModal").show();
}

function hideModal() {
    $("#errorModal").hide();
}

// ── Wallet Loader ────────────────────────────────────────────────────────────

function loadWalletFromKeystore(
    keystoreFileSelector,
    passwordSelector,
    onSuccess
) {

    if (Date.now() < decryptLockUntil) {

        const seconds = Math.ceil(
            (decryptLockUntil - Date.now()) / 1000
        );

        showModal(
            "Too many failed attempts. Try again in "
            + seconds +
            " seconds."
        );

        return;
    }

    const password = $(passwordSelector).val();

    if (!password) {
        showModal("Please enter a password");
        return;
    }

    const file = $(keystoreFileSelector)[0].files[0];

    if (!file) {
        showModal("Please select a keystore file");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const keystoreString = e.target.result;

            const wallet = web3.eth.accounts.decrypt(
                keystoreString,
                password
            );

            failedDecryptAttempts = 0;

            onSuccess(wallet, keystoreString);

        } catch (error) {

            failedDecryptAttempts++;

            if (failedDecryptAttempts >= MAX_DECRYPT_ATTEMPTS) {

                decryptLockUntil =
                    Date.now() + DECRYPT_LOCK_MS;

                failedDecryptAttempts = 0;

                showModal(
                    "Too many failed attempts. " +
                    "Locked for 60 seconds."
                );

                return;
            }

            showModal(
                "Failed to decrypt wallet: "
                + error.message
            );
        }
    };

    reader.readAsText(file);
}

// ── Transaction helper ───────────────────────────────────────────────────────

function signAndSend(tx, privateKey, onSuccess, onHash) {

    showModal("Preparing transaction…");

    web3.eth.getTransactionCount(tx.from, "pending")

        .then(function (nonce) {

            tx.nonce = nonce;

            return web3.eth.estimateGas(tx)
                .then(function (estimated) {

                    tx.gas = Math.ceil(
                        estimated * 1.3
                    );

                    return tx;
                });
        })

        .then(function (preparedTx) {

            return web3.eth.accounts.signTransaction(
                preparedTx,
                privateKey
            );
        })

        .then(function (signedTx) {

            web3.eth.sendSignedTransaction(
                signedTx.rawTransaction
            )

            .on("transactionHash", function (hash) {

                const explorerUrl =
                    EXPLORER_BASE + "/tx/" + hash;

                showModal(
                    "Submitted!",
                    explorerUrl,
                    "Track on Etherscan"
                );

                if (typeof onHash === "function") {
                    onHash(hash);
                }
            })

            .on("receipt", function (receipt) {
                onSuccess(tx, receipt);
            })

            .on("error", function (error) {

                showModal(
                    "Transaction failed: "
                    + error.message
                );
            });
        })

        .catch(function (err) {

            showModal(
                "Transaction error: "
                + err.message
            );
        });
}

// ── DOM Ready ────────────────────────────────────────────────────────────────

$(document).ready(function () {

    $("#closeModal").click(function () {
        hideModal();
    });

});


// ─────────────────────────────────────────────────────────────────────────────
// Jest / Node compatibility exports
// Keeps browser-global behaviour unchanged
// ─────────────────────────────────────────────────────────────────────────────

if (typeof module !== "undefined" && module.exports) {

    module.exports = {

        getContract,
        connectMetaMask,
        loadWalletFromKeystore,
        signAndSend,
        showModal,
        hideModal,

        // exported for testing visibility
        EXPLORER_BASE,

        // optional debugging/testing
        web3
    };
}