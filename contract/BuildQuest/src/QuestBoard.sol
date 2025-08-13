// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/*
 * QuestBoard (MVP)
 * - Creators can create a quest with (optional) ETH prize escrowed in contract.
 * - Builders submit work (URI pointing to IPFS / link) before deadline.
 * - After deadline creator selects winners and specifies a payout address to receive full prize (single lump sum for MVP).
 * Future: per-winner split, reclaim path, cancellation, pull-based withdrawals, metadata hashing.
 */
contract QuestBoard {
    struct Quest {
        address creator;
        uint96 deadline;      // unix seconds
        uint96 prizeWei;       // single prize pool
        bool winnersSelected;  // locked once winners chosen
        string title;          // short title
        string uri;            // metadata / description reference
    }

    struct Submission {
        address submitter;
        string uri;   // submission reference
        bool winner;  // flagged if selected
    }

    // questId => Quest
    mapping(uint256 => Quest) public quests;
    // questId => submissions array
    mapping(uint256 => Submission[]) internal _subs;
    uint256 public questCount;

    // ========= Events =========
    event QuestCreated(uint256 indexed questId, address indexed creator, uint256 deadline, uint256 prizeWei, string title, string uri);
    event SubmissionAdded(uint256 indexed questId, uint256 indexed submissionId, address indexed submitter, string uri);
    event WinnersSelected(uint256 indexed questId, uint256[] winnerIds);

    // ========= Errors =========
    error NotCreator();
    error PastDeadline();
    error DeadlineNotReached();
    error AlreadySelected();
    error InvalidQuest();

    // ========= Core Logic =========
    function createQuest(uint96 deadline, string memory title, string memory uri) external payable returns (uint256 questId) {
        if (deadline <= block.timestamp) revert PastDeadline();
        questId = ++questCount;
        quests[questId] = Quest({
            creator: msg.sender,
            deadline: deadline,
            prizeWei: uint96(msg.value),
            winnersSelected: false,
            title: title,
            uri: uri
        });
        emit QuestCreated(questId, msg.sender, deadline, msg.value, title, uri);
    }

    function submit(uint256 questId, string memory uri) external {
        Quest storage q = quests[questId];
        if (q.creator == address(0)) revert InvalidQuest();
        if (block.timestamp > q.deadline) revert PastDeadline();
        _subs[questId].push(Submission({ submitter: msg.sender, uri: uri, winner: false }));
        emit SubmissionAdded(questId, _subs[questId].length - 1, msg.sender, uri);
    }

    function selectWinners(uint256 questId, uint256[] calldata winnerIds, address payable payoutAddress) external {
        Quest storage q = quests[questId];
        if (q.creator != msg.sender) revert NotCreator();
        if (block.timestamp < q.deadline) revert DeadlineNotReached();
        if (q.winnersSelected) revert AlreadySelected();
        Submission[] storage arr = _subs[questId];
        for (uint256 i = 0; i < winnerIds.length; i++) {
            uint256 sid = winnerIds[i];
            if (sid < arr.length) {
                arr[sid].winner = true;
            }
        }
        q.winnersSelected = true;
        emit WinnersSelected(questId, winnerIds);
        if (q.prizeWei > 0 && payoutAddress != address(0)) {
            uint256 amt = q.prizeWei;
            q.prizeWei = 0; // Effects before interaction
            (bool ok, ) = payoutAddress.call{value: amt}("");
            require(ok, "PAYOUT_FAIL");
        }
    }

    // View helper to fetch submissions
    function submissions(uint256 questId) external view returns (Submission[] memory) {
        return _subs[questId];
    }
}
