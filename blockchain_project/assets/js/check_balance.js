// Handles check-balance.html — works for attendee, doorman, and venue
function formatTokenAmount(rawBalance, decimals) {
    const x = BigInt(rawBalance);
    const d = BigInt(decimals);
    const denom = 10n ** d;
    const whole = x / denom;
    const frac = (x % denom).toString().padStart(Number(decimals), "0").replace(/0+$/, "");
    return frac.length ? whole.toString() + "." + frac : whole.toString();
}

$(document).ready(function () {
    if (typeof CONFIG !== "undefined" && CONFIG.CONTRACT_ADDRESS) {
        $("#tokenAddress").val(CONFIG.CONTRACT_ADDRESS);
    }

    $("#cryptoBalanceButton").click(function () {
        const walletAddress = $("#walletAddress").val().trim();

        if (web3.utils.isAddress(walletAddress)) {
            web3.eth.getBalance(walletAddress)
                .then(function (balance) {
                    const eth = web3.utils.fromWei(balance, "ether");
                    $("#cryptoBalance").html("<strong>Crypto Balance: " + eth + " ETH</strong>");
                })
                .catch(function (err) {
                    $("#errorMessage").text(err.message || String(err));
                    $("#errorModal").show();
                });
        } else {
            $("#errorMessage").text("Invalid wallet address");
            $("#errorModal").show();
        }
    });

    $("#tokenBalanceButton").click(function () {
        const walletAddress = $("#walletAddress").val().trim();
        const tokenAddress = $("#tokenAddress").val().trim();

        if (!web3.utils.isAddress(walletAddress) || !web3.utils.isAddress(tokenAddress)) {
            $("#errorMessage").text("Invalid wallet or token contract address");
            $("#errorModal").show();
            return;
        }

        const token = new web3.eth.Contract(CONTRACT_ABI, tokenAddress);

        Promise.all([
            token.methods.balanceOf(walletAddress).call(),
            token.methods.decimals().call(),
            token.methods.name().call(),
            token.methods.symbol().call(),
            token.methods.totalSupply().call(),
        ])
            .then(function (results) {
                const balance = results[0];
                const decimals = results[1];
                const name = results[2];
                const symbol = results[3];
                const totalSupply = results[4];
                const formatted = formatTokenAmount(balance, decimals);
                $("#tokenBalance").html(
                    "<strong>Token Balance: " + formatted + " " + symbol + "</strong> (raw: " + balance + ")"
                );
                $("#tokenName").text("Token Name: " + name);
                $("#tokenSymbol").text("Token Symbol: " + symbol);
                $("#tokenDecimals").text("Token Decimals: " + decimals);
                $("#tokenTotalSupply").text(
                    "Token Total Supply: " + formatTokenAmount(totalSupply, decimals) + " (raw: " + totalSupply + ")"
                );
            })
            .catch(function (err) {
                $("#errorMessage").text(err.message || String(err));
                $("#errorModal").show();
            });
    });

    $("#closeModal").click(() => $("#errorModal").hide());
});
