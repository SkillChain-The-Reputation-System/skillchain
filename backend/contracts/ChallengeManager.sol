// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

// TODO: Think about store participants, voting mechanics, linking solutions, fee... | Moderation: verify challenge and upload to Explore
contract ChallengeManager {
    enum ChallengeStatus {
        pending,
        approved,
        rejected
    }

    struct Challenge {
        address contributor;
        string titleUrl;
        string descriptionUrl;
        uint256 category;
        uint256 contributeAt;
        ChallengeStatus status;
        // // Predefined attributes that might use in future
        // uint256 upVotes;
        // uint256 downVotes;
        // uint256 participants;
    }

    mapping(uint256 => Challenge) public challenges; // TODO: optizime storing challenges
    uint256 public totalChallenges = 0;
    uint256 public pendingChallenges = 0;

    mapping(address => uint256[]) public contributorToChallenges;

    event ChallengeContributed(
        address indexed contributor,
        string titleUrl,
        string descriptionUrl,
        uint256 category,
        uint256 contributeAt
    );

    function contributeChallenge(
        string calldata titleUrl,
        string calldata descriptionUrl,
        uint256 category,
        uint256 contributeAt
    ) external {
        uint256 challengeId = totalChallenges++;

        challenges[challengeId] = Challenge({
            contributor: msg.sender,
            titleUrl: titleUrl,
            descriptionUrl: descriptionUrl,
            category: category,
            contributeAt: contributeAt,
            status: ChallengeStatus.pending
        });

        contributorToChallenges[msg.sender].push(challengeId);
        pendingChallenges++;

        console.log(
            "Challenge #%s contributed by %s at %s with:",
            challengeId,
            msg.sender,
            contributeAt
        );
        console.log("- Title url        : %s", titleUrl);
        console.log("- Description url  : %s", descriptionUrl);

        emit ChallengeContributed(
            msg.sender,
            titleUrl,
            descriptionUrl,
            category,
            contributeAt
        );
    }

    function getChallengesByContributor(
        address contributor_address
    ) public view returns (Challenge[] memory) {
        uint256[] memory challengeIds = contributorToChallenges[
            contributor_address
        ];
        Challenge[] memory contributorChallenges = new Challenge[](
            challengeIds.length
        );

        for (uint256 i = 0; i < challengeIds.length; i++) {
            contributorChallenges[i] = challenges[challengeIds[i]];
        }

        console.log(
            "User %s had fetched %s contributed challenges",
            contributor_address,
            challengeIds.length
        );

        return contributorChallenges;
    }

    function getPendingChallenges() public view returns (Challenge[] memory) {
        Challenge[] memory pendingChallengeList = new Challenge[](
            pendingChallenges
        );

        for (uint256 i = 0; i < totalChallenges; i++) {
            if (challenges[i].status == ChallengeStatus.pending)
                pendingChallengeList[i] = challenges[i];
        }

        console.log(
            "User %s had fetch %s pending contributed challenges",
            msg.sender,
            pendingChallengeList.length
        );

        return pendingChallengeList;
    }
}
