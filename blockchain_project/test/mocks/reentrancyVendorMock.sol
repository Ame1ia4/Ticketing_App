// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/ticket_v2.sol";

contract ReentrantVendorMock {

    TicketToken public token;

    constructor() {
        token = new TicketToken(
            "TicketToken",
            "TIX",
            18,
            1000
        );
    }

    receive() external payable {
        token.withdraw();
    }

    function attack() external {
        token.buyToken{value: 0.00001 ether}();
        token.withdraw();
    }
}