// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Test.sol";
import "../src/QuestBoard.sol";

contract QuestBoardTest is Test {
    QuestBoard qb;
    address creator = address(0xC0FFEE);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        qb = new QuestBoard();
        vm.deal(creator, 10 ether);
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
    }

    function testCreateQuest() public {
        vm.prank(creator);
        uint256 id = qb.createQuest{value: 1 ether}(uint96(block.timestamp + 1 days), "Title", "ipfs://meta");
        assertEq(id, 1);
        (address c,,uint96 prize,,string memory title,) = qb.quests(1);
        assertEq(c, creator);
        assertEq(prize, 1 ether);
        assertEq(title, "Title");
    }

    function testSubmitAndSelectWinner() public {
        vm.prank(creator);
        uint256 id = qb.createQuest{value: 2 ether}(uint96(block.timestamp + 1 days), "Quest", "ipfs://meta");

        vm.prank(alice);
        qb.submit(id, "ipfs://sub1");
        vm.prank(bob);
        qb.submit(id, "ipfs://sub2");

        // Fast forward past deadline
        vm.warp(block.timestamp + 2 days);
        address payout = address(0xFEE);
        uint256 balBefore = payout.balance;
        vm.prank(creator);
        uint256[] memory winnerIds = new uint256[](1);
        winnerIds[0] = 1; // bob's submission index (0 or 1)
        qb.selectWinners(id, winnerIds, payable(payout));
        assertGt(payout.balance, balBefore);
        QuestBoard.Submission[] memory subs = qb.submissions(id);
        assertTrue(subs[1].winner);
    }
}
