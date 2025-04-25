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
        string title_url;
        string description_url;
        uint256 category;
        uint256 contribute_at;
        ChallengeStatus status;
        // Predefined attributes that might use in future
        // uint256 quality_score;
        // ChallengeDifficulty difficulty_level;
        // uint256 solve_time [in ms | s | minutes | hours ... ?]
        // string[] tags;
    }

    mapping(uint256 => Challenge) public challenges; // TODO: optizime storing challenges
    uint256 public total_challenges = 0;
    uint256 public pending_challenges = 0;

    mapping(address => uint256[]) public contributor_to_challenges;

    event ChallengeContributed(
        address indexed contributor,
        string titleUrl,
        string descriptionUrl,
        uint256 category,
        uint256 contributeAt
    );

    function contributeChallenge(
        string calldata _title_url,
        string calldata _description_url,
        uint256 _category,
        uint256 _contribute_at
    ) external {
        uint256 challengeId = total_challenges++;

        challenges[challengeId] = Challenge({
            contributor: msg.sender,
            title_url: _title_url,
            description_url: _description_url,
            category: _category,
            contribute_at: _contribute_at,
            status: ChallengeStatus.pending
        });

        contributor_to_challenges[msg.sender].push(challengeId);
        pending_challenges++;

        console.log(
            "Challenge #%s contributed by %s at %s with:",
            challengeId,
            msg.sender,
            _contribute_at
        );
        console.log("- Title url        : %s", _title_url);
        console.log("- Description url  : %s", _description_url);

        emit ChallengeContributed(
            msg.sender,
            _title_url,
            _description_url,
            _category,
            _contribute_at
        );
    }

    function getChallengesByContributor(
        address _contributor_address
    ) public view returns (Challenge[] memory) {
        uint256[] memory challengeIds = contributor_to_challenges[
            _contributor_address
        ];
        Challenge[] memory contributorChallenges = new Challenge[](
            challengeIds.length
        );

        for (uint256 i = 0; i < challengeIds.length; i++) {
            contributorChallenges[i] = challenges[challengeIds[i]];
        }

        console.log(
            "User %s had fetched %s contributed challenges",
            _contributor_address,
            challengeIds.length
        );

        return contributorChallenges;
    }

    function getPendingChallenges() public view returns (Challenge[] memory) {
        Challenge[] memory pendingChallengeList = new Challenge[](
            pending_challenges
        );

        for (uint256 i = 0; i < total_challenges; i++) {
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
