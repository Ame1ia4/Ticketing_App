$(document).ready(function () {
    const contract = getContract();

    $("#loadWalletButton").click(function(){

        if ($("#password").val() == ""){
            showModal("Please enter a password");
            return;
        }

        var file = $("#keystoreFile")[0].files[0];
        if (!file){
            showModal("Please select a file");
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e){
            var keystore = e.target.result;
            var password = $("#password").val();

            try {
                var wallet = web3.eth.accounts.decrypt(keystore, password);
                $("#walletAddress").val(wallet.address);
                $("#privateKey").val(wallet.privateKey);
                $("#keystore").val(keystore);
            } catch (error) {
                showModal(error.message);
            }
        };
        reader.readAsText(file);
    });

    $("#transferButton").click(function(){

        var privateKey = $("#privateKey").val();

        if (privateKey == ""){
            showModal("Please enter a private key");
            return;
        }

        var wallet = web3.eth.accounts.privateKeyToAccount(privateKey);

        var transaction = contract.methods.transferBack();
        var encodedABI = transaction.encodeABI();

        var tx = {
            from: wallet.address,
            to: CONFIG.CONTRACT_ADDRESS,
            gas: 2000000,
            data: encodedABI
        };

        showModal("Transaction in progress. This could take ~30s");

        web3.eth.accounts.signTransaction(tx, privateKey)
        .then(function(signedTx){
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('receipt', function(receipt){
                $("#transactionRequest").val(JSON.stringify(tx));
                $("#transactionResult").val(JSON.stringify(receipt));
                showModal("Transfer successful");
            });
        });
    });
});