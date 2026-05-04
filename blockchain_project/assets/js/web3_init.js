const web3 = new Web3(CONFIG.INFURA_URL);// Shared read-only provider for all interactions

// Get a contract instance
function getContract() {
    return new web3.eth.Contract(CONTRACT_ABI, CONFIG.CONTRACT_ADDRESS);
}

// Show/hide the modal
function showModal(message) {
    $("#errorMessage").text(message);
    $("#errorModal").show();
}

function hideModal() {
    $("#errorModal").hide();
}

$(document).ready(function () {
    $("#closeModal").click(() => hideModal());
});