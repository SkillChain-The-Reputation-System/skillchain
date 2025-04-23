// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChallengeManager {
    struct Challenge {
        address contributor;
        string titleUrl;
        bool isActive;
    }

    mapping(uint256 => Challenge) public challenges;
    uint256 public totalChallenges = 0;

    mapping(address => uint256[]) public contributorToChallenges;

    event ChallengeContributed(address indexed contributor, string titleUrl);

    function contributeChallenge(string calldata titleUrl) external {
        uint256 challengeId = totalChallenges++;

        challenges[challengeId] = Challenge({
            contributor: msg.sender,
            titleUrl: titleUrl,
            isActive: false
        });

        contributorToChallenges[msg.sender].push(challengeId);

        emit ChallengeContributed(msg.sender, titleUrl);
    }

    function getChallengesByContributor()
        public
        view
        returns (Challenge[] memory)
    {
        uint256[] memory challengeIds = contributorToChallenges[msg.sender];
        Challenge[] memory contributorChallenges = new Challenge[](
            challengeIds.length
        );

        for (uint256 i = 0; i < challengeIds.length; i++) {
            contributorChallenges[i] = challenges[challengeIds[i]];
        }

        return contributorChallenges;
    }
}
