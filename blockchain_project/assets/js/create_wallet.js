// Handles create-wallet.html
$(document).ready(function () {
    $("#createWalletButton").click(function () {
        const password = $("#password").val();
        if (!password) { showModal("Please enter a password"); return; }

        const web3 = new Web3();
        const wallet = web3.eth.accounts.create();
        const keystore = web3.eth.accounts.encrypt(wallet.privateKey, password);

        $("#walletAddress").val(wallet.address);
        $("#privateKey").val(wallet.privateKey);
        $("#keystore").val(JSON.stringify(keystore, null, 2));
    });

    $("#downloadKeystore").click(function () {
        const keystore = $("#keystore").val();
        if (!keystore) { showModal("Create a wallet first"); return; }

        const blob = new Blob([keystore], { type: "application/json" });
        const address = $("#walletAddress").val();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = address + ".json";
        a.click();
    });
});