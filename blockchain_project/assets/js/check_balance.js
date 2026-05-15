// ─────────────────────────────────────────────────────────────────────────────
// check_balance.js — handles check-balance.html for attendee, doorman, venue.
//
// Changes from review:
//
// No critical or warning-level issues in the original. Minor improvements:
//
// [USABILITY-1] ETH balance is formatted to 6 decimal places to avoid
//               scientific notation on very small balances.
//
// [USABILITY-2] Token balance section is cleared on each new query so stale
//               results from a previous address don't persist if the new query
//               fails.
//
// [DEFENSIVE-1] Both catch() handlers now use showModal() (consistent with
//               other pages) rather than directly manipulating #errorModal.
// ─────────────────────────────────────────────────────────────────────────────

function formatTokenAmount(rawBalance, decimals) {
    const x     = BigInt(rawBalance);
    const d     = BigInt(decimals);
    const denom = 10n ** d;
    const whole = x / denom;
    const frac  = (x % denom).toString().padStart(Number(decimals), "0").replace(/0+$/, "");
    return frac.length ? whole.toString() + "." + frac : whole.toString();
}

$(document).ready(function () {
    if (typeof CONFIG !== "undefined" && CONFIG.CONTRACT_ADDRESS) {
        $("#tokenAddress").val(CONFIG.CONTRACT_ADDRESS);
    }

    // ── ETH Balance ───────────────────────────────────────────────────────────

    $("#cryptoBalanceButton").click(function () {
        const walletAddress = $("#walletAddress").val().trim();

        if (!web3.utils.isAddress(walletAddress)) {
            showModal("Invalid wallet address");
            return;
        }

        web3.eth.getBalance(walletAddress)
            .then(function (balance) {
                // [USABILITY-1] toFixed(6) avoids scientific notation.
                const eth = parseFloat(web3.utils.fromWei(balance, "ether")).toFixed(6);
                $("#cryptoBalance").html("<strong>Crypto Balance: " + eth + " ETH</strong>");
            })
            .catch(function (err) {
                showModal(err.message || String(err));
            });
    });

    // ── Token Balance ─────────────────────────────────────────────────────────

    $("#tokenBalanceButton").click(function () {
        const walletAddress = $("#walletAddress").val().trim();
        const tokenAddress  = $("#tokenAddress").val().trim();

        if (!web3.utils.isAddress(walletAddress) || !web3.utils.isAddress(tokenAddress)) {
            showModal("Invalid wallet or token contract address");
            return;
        }

        // [USABILITY-2] Clear previous results so stale data doesn't persist.
        $("#tokenBalance, #tokenName, #tokenSymbol, #tokenDecimals, #tokenTotalSupply").text("");

        const token = new web3.eth.Contract(CONTRACT_ABI, tokenAddress);

        Promise.all([
            token.methods.balanceOf(walletAddress).call(),
            token.methods.decimals().call(),
            token.methods.name().call(),
            token.methods.symbol().call(),
            token.methods.totalSupply().call(),
        ])
            .then(function ([balance, decimals, name, symbol, totalSupply]) {
                const formatted = formatTokenAmount(balance, decimals);
                $("#tokenBalance").html(
                    "<strong>Token Balance: " + formatted + " " + symbol + "</strong> (raw: " + balance + ")"
                );
                $("#tokenName").text("Token Name: " + name);
                $("#tokenSymbol").text("Token Symbol: " + symbol);
                $("#tokenDecimals").text("Token Decimals: " + decimals);
                $("#tokenTotalSupply").text(
                    "Token Total Supply: " +
                    formatTokenAmount(totalSupply, decimals) +
                    " (raw: " + totalSupply + ")"
                );
            })
            .catch(function (err) {
                showModal(err.message || String(err));
            });
    });

    $("#closeModal").click(() => hideModal());
});
