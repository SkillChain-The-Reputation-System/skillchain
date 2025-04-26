// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

// TODO: Think about store participants, voting mechanics, linking solutions, fee... | Moderation: verify challenge and upload to Explore
contract ChallengeManager {
    // ================= ENUMS =================
    enum ChallengeStatus {
        PENDING,  // 0
        APPROVED, // 1
        REJECTED  // 2
    }

    enum DifficultyLevel {
        EASY,   // 0
        MEDIUM, // 1
        HARD    // 2
    }

    enum Domain {
        COMPUTER_SCIENCE_FUNDAMENTALS, // 0
        SOFTWARE_DEVELOPMENT,          // 1
        SYSTEMS_AND_NETWORKING,        // 2
        CYBERSECURITY,                 // 3
        DATA_SCIENCE_AND_ANALYTICS,    // 4
        DATABASE_ADMINISTRATION,       // 5
        QUALITY_ASSURANCE_AND_TESTING, // 6
        PROJECT_MANAGEMENT,            // 7
        USER_EXPERIENCE_AND_DESIGN,    // 8
        BUSINESS_ANALYSIS,             // 9
        ARTFIFICIAL_INTELLIGENCE,      // 10
        BLOCKCHAIN_AND_CRYPTOCURRENCY, // 11
        NETWORK_ADMINISTRATION,        // 12
        CLOUD_COMPUTING                // 13
    }

    // ================= STRUCTS =================
    struct Challenge {
        address contributor;
        string title_url;
        string description_url;
        Domain category;
        uint256 contribute_at;
        ChallengeStatus status;
        // Predefined attributes that might use in future
        // uint256 quality_score;
        // ChallengeDifficulty difficulty_level;
        // uint256 solve_time [in ms | s | minutes | hours ... ?]
        // string[] tags;
    }

    struct ModeratorReview {
        address moderator;
        uint256 challenge_id;
        uint256 review_time;
        bool relevance;
        bool technical_correctness;
        bool completeness;
        bool clarity;
        bool originality;
        bool unbiased;
        bool plagiarism_free;
        DifficultyLevel suggested_difficulty;
        Domain suggested_category;
        uint256 suggested_solve_time;
        string[] suggested_tags;
    }

    struct ReviewPool {
        address[] moderator_list;
        uint256 total_review;
        ModeratorReview[] moderator_reviews;
        mapping(address => uint256) moderator_to_review_pool_id;
    }

    // ================= STATE VARIABLES =================
    // Mapping: Challenge ID -> Challenge
    mapping(uint256 => Challenge) public challenges; // TODO: optizime storing challenges
    // Mapping: Challenge ID -> Review Pool
    mapping(uint256 => ReviewPool) public review_pool;
    // Mapping: Contributor address -> Challenge IDs
    mapping(address => uint256[]) public contributor_to_challenges;
    // Mapping: Moderator address -> Review Pool IDs
    mapping(address => uint256[]) public moderator_to_review_pools;

    uint256 public total_challenges = 0;
    uint256 public pending_challenges = 0;
    uint256 public quorum = 3; // The maximum number of moderators needed to approve a challenge
    uint256 public pass_threshold = 80; // The threshold of quality score for a challenge to be approved

    // ================= EVENTS =================
    event ChallengeContributed(
        address indexed contributor,
        string titleUrl,
        string descriptionUrl,
        Domain category,
        uint256 contributeAt
    );

    // ================= CONTRIBUTION METHODS =================
    function contributeChallenge(
        string calldata _title_url,
        string calldata _description_url,
        Domain _category,
        uint256 _contribute_at
    ) external {
        uint256 challengeId = total_challenges++;

        challenges[challengeId] = Challenge({
            contributor: msg.sender,
            title_url: _title_url,
            description_url: _description_url,
            category: _category,
            contribute_at: _contribute_at,
            status: ChallengeStatus.PENDING
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

    // ================= MODERATION METHODS=================
    function joinReviewPool(uint256 _challenge_id) public {
        review_pool[_challenge_id].moderator_list.push(msg.sender);
        moderator_to_review_pools[msg.sender].push(_challenge_id);
    }

    // ================= GETTER METHODS =================
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
            if (challenges[i].status == ChallengeStatus.PENDING)
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
