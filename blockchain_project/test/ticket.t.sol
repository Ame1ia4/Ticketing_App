
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ticket_v2.sol";

contract TicketTokenTest is Test {
  
    receive() external payable {}



    TicketToken token;

    address vendor = address(this);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    uint256 constant INITIAL_SUPPLY = 1000;
    uint256 constant TOKEN_PRICE = 0.00001 ether;

    // ---------------------------------------------------------------------
    // Setup
    // ---------------------------------------------------------------------

    function setUp() public {

        token = new TicketToken(
            "TicketToken",
            "TIX",
            18,
            INITIAL_SUPPLY
        );

        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ---------------------------------------------------------------------
    // Deployment
    // ---------------------------------------------------------------------

    function testDeploymentValues() public {

        assertEq(token.name(), "TicketToken");
        assertEq(token.symbol(), "TIX");
        assertEq(token.decimals(), 18);

        assertEq(
            token.vendor(),
            vendor
        );
    }

    function testInitialSupplyAssignedToVendor() public {

        uint256 expected =
            INITIAL_SUPPLY * (10 ** 18);

        assertEq(
            token.balanceOf(vendor),
            expected
        );
    }

    // ---------------------------------------------------------------------
    // Transfers
    // ---------------------------------------------------------------------

    function testTransfer() public {

        uint256 amount = 100 ether;

        token.transfer(alice, amount);

        assertEq(
            token.balanceOf(alice),
            amount
        );
    }

    function testTransferFailsInsufficientBalance() public {

        vm.prank(alice);

        vm.expectRevert(
            bytes("Insufficient balance")
        );

        token.transfer(bob, 1 ether);
    }

    // ---------------------------------------------------------------------
    // Approvals
    // ---------------------------------------------------------------------

    function testApprove() public {

        token.approve(alice, 100 ether);

        assertEq(
            token.allowance(vendor, alice),
            100 ether
        );
    }

    function testTransferFrom() public {

        token.approve(alice, 100 ether);

        vm.prank(alice);

        token.transferFrom(
            vendor,
            bob,
            50 ether
        );

        assertEq(
            token.balanceOf(bob),
            50 ether
        );

        assertEq(
            token.allowance(vendor, alice),
            50 ether
        );
    }

    function testTransferFromFailsWithoutAllowance() public {

        vm.prank(alice);

        vm.expectRevert(
            bytes("Allowance exceeded")
        );

        token.transferFrom(
            vendor,
            bob,
            1 ether
        );
    }

    // ---------------------------------------------------------------------
    // Buy Token
    // ---------------------------------------------------------------------

    function testBuyToken() public {

        vm.prank(alice);

        token.buyToken{
            value: TOKEN_PRICE
        }();

        assertEq(
            token.balanceOf(alice),
            1 ether
        );
    }

    function testBuyTokenFailsInsufficientETH() public {

        vm.prank(alice);

        vm.expectRevert(
            bytes("Insufficient ETH")
        );

        token.buyToken{value: 1 wei}();
    }

    // ---------------------------------------------------------------------
    // transferBack
    // ---------------------------------------------------------------------

    function testTransferBack() public {

        vm.prank(alice);

        token.buyToken{
            value: TOKEN_PRICE
        }();

        vm.prank(alice);

        token.transferBack();

        assertEq(
            token.balanceOf(alice),
            0
        );
    }

    function testTransferBackFailsNoBalance() public {

        vm.prank(alice);

        vm.expectRevert(
            bytes("No tickets to return")
        );

        token.transferBack();
    }

    // ---------------------------------------------------------------------
    // Withdraw
    // ---------------------------------------------------------------------

    function testWithdraw() public {

        vm.prank(alice);

        token.buyToken{
            value: TOKEN_PRICE
        }();

        uint256 beforeBalance =
            vendor.balance;

        token.withdraw();

        uint256 afterBalance =
            vendor.balance;

        assertEq(
            afterBalance,
            beforeBalance + TOKEN_PRICE
        );
    }

    function testWithdrawFailsNonVendor() public {

        vm.prank(alice);

        vm.expectRevert(
            bytes("Only vendor")
        );

        token.withdraw();
    }

    function testWithdrawFailsNoBalance() public {

        vm.expectRevert(
            bytes("Nothing to withdraw")
        );

        token.withdraw();
    }

    // ---------------------------------------------------------------------
    // Fuzz Test
    // ---------------------------------------------------------------------

    function testFuzzTransfer(
        uint256 amount
    ) public {

        uint256 max =
            token.balanceOf(vendor);

        amount = bound(
            amount,
            1,
            max
        );

        token.transfer(alice, amount);

        assertEq(
            token.balanceOf(alice),
            amount
        );
    }
}

