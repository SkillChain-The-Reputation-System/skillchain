// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract ChallengeManager {
    struct Challenge {
        address contributor;
        string titleUrl;
        string descriptionUrl;
        string category;
        string contributeAt;
        bool isApproved;
    }

    mapping(uint256 => Challenge) public challenges;
    uint256 public totalChallenges = 0;

    mapping(address => uint256[]) public contributorToChallenges;

    event ChallengeContributed(
        address indexed contributor,
        string titleUrl,
        string descriptionUrl,
        string category,
        string contributeAt
    );

    function contributeChallenge(
        string calldata titleUrl,
        string calldata descriptionUrl,
        string calldata category,
        string calldata contributeAt
    ) external {
        uint256 challengeId = totalChallenges++;

        challenges[challengeId] = Challenge({
            contributor: msg.sender,
            titleUrl: titleUrl,
            descriptionUrl: descriptionUrl,
            category: category,
            contributeAt: contributeAt,
            isApproved: false
        });

        contributorToChallenges[msg.sender].push(challengeId);

        console.log(
            "Challenge #%s contributed by %s with:",
            challengeId,
            msg.sender
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
            "User %s had fetch %s contributed challenges",
            contributor_address,
            challengeIds.length
        );

        return contributorChallenges;
    }
}
