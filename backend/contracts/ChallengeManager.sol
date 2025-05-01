// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

// TODO: Think about store participants, voting mechanics, linking solutions, fee... | Moderation: verify challenge and upload to Explore
contract ChallengeManager {
    // ================= ENUMS =================
    enum ChallengeStatus {
        PENDING, // 0
        APPROVED, // 1
        REJECTED // 2
    }

    enum DifficultyLevel {
        EASY, // 0
        MEDIUM, // 1
        HARD // 2
    }

    enum QualityFactorAnswer {
        YES, // 0
        NO // 1
    }

    enum Domain {
        COMPUTER_SCIENCE_FUNDAMENTALS, // 0
        SOFTWARE_DEVELOPMENT, // 1
        SYSTEMS_AND_NETWORKING, // 2
        CYBERSECURITY, // 3
        DATA_SCIENCE_AND_ANALYTICS, // 4
        DATABASE_ADMINISTRATION, // 5
        QUALITY_ASSURANCE_AND_TESTING, // 6
        PROJECT_MANAGEMENT, // 7
        USER_EXPERIENCE_AND_DESIGN, // 8
        BUSINESS_ANALYSIS, // 9
        ARTIFICIAL_INTELLIGENCE, // 10
        BLOCKCHAIN_AND_CRYPTOCURRENCY, // 11
        NETWORK_ADMINISTRATION, // 12
        CLOUD_COMPUTING // 13
    }

    // ================= STRUCTS =================
    struct Challenge {
        uint256 id;
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
        QualityFactorAnswer relevance;
        QualityFactorAnswer technical_correctness;
        QualityFactorAnswer completeness;
        QualityFactorAnswer clarity;
        QualityFactorAnswer originality;
        QualityFactorAnswer unbiased;
        QualityFactorAnswer plagiarism_free;
        DifficultyLevel suggested_difficulty;
        Domain suggested_category;
        uint256 suggested_solve_time;
    }

    struct ReviewPool {
        address[] moderator_list;
        // Mapping: Moderator address -> Moderator review
        mapping(address => ModeratorReview) moderator_reviews;
        // Mapping: Moderator address -> Joined status
        mapping(address => bool) moderator_to_join_status;
    }

    // ================= STATE VARIABLES =================
    // Mapping: Challenge ID -> Challenge
    mapping(uint256 => Challenge) private challenges; // TODO: optizime storing challenges
    // Mapping: Challenge ID -> Review Pool
    mapping(uint256 => ReviewPool) private review_pool;
    // Mapping: Contributor address -> Challenge IDs
    mapping(address => uint256[]) private contributor_to_challenges;
    // Mapping: Moderator address -> Challenge IDs
    mapping(address => uint256[]) private moderator_to_challenges;

    uint256 public total_challenges = 0;
    uint256 public pending_challenges = 0;
    uint256 public quorum = 3; // The number of moderators needed to approve a challenge
    uint256 public pass_threshold = 80; // The threshold of quality score for a challenge to be approved

    // ================= EVENTS =================
    event ChallengeContributed(
        address indexed contributor,
        string title_url,
        string description_url,
        Domain category,
        uint256 contribute_at
    );
    // Emitted when a moderator joins a review pool
    event ReviewPoolJoined(
        uint256 indexed challenge_id,
        address indexed moderator
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
            id: challengeId,
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
        // Prevent duplicate joining of the same review pool
        require(
            review_pool[_challenge_id].moderator_to_join_status[msg.sender] ==
                false,
            "You have already joined this review pool."
        );

        // Add new challenge to the moderator's list of challenges
        moderator_to_challenges[msg.sender].push(_challenge_id);
        // Use a storage reference for cleaner access
        ReviewPool storage pool = review_pool[_challenge_id];
        pool.moderator_list.push(msg.sender);
        pool.moderator_to_join_status[msg.sender] = true;

        emit ReviewPoolJoined(_challenge_id, msg.sender);
        console.log(
            "Moderator %s joined review pool for challenge #%s",
            msg.sender,
            _challenge_id
        );
    }

    function updateModeratorReview(
        uint256 _challenge_id,
        QualityFactorAnswer _relevance,
        QualityFactorAnswer _technical_correctness,
        QualityFactorAnswer _completeness,
        QualityFactorAnswer _clarity,
        QualityFactorAnswer _originality,
        QualityFactorAnswer _unbiased,
        QualityFactorAnswer _plagiarism_free,
        DifficultyLevel _suggested_difficulty,
        Domain _suggested_category,
        uint256 _suggested_solve_time
    ) public {
        // Check if the moderator has joined the review pool
        require(
            review_pool[_challenge_id].moderator_to_join_status[msg.sender] ==
                true,
            "You have not joined this review pool."
        );

        // Update the moderator's review in the review pool
        ReviewPool storage pool = review_pool[_challenge_id];
        pool.moderator_reviews[msg.sender] = ModeratorReview({
            moderator: msg.sender,
            challenge_id: _challenge_id,
            review_time: block.timestamp,
            relevance: _relevance,
            technical_correctness: _technical_correctness,
            completeness: _completeness,
            clarity: _clarity,
            originality: _originality,
            unbiased: _unbiased,
            plagiarism_free: _plagiarism_free,
            suggested_difficulty: _suggested_difficulty,
            suggested_category: _suggested_category,
            suggested_solve_time: _suggested_solve_time
        });

        console.log(
            "Moderator %s updated review for challenge #%s",
            msg.sender,
            _challenge_id
        );
        console.log("- Relevance: %s", uint((_relevance)));
        console.log(
            "- Technical correctness: %s",
            uint((_technical_correctness))
        );
        console.log("- Completeness: %s", uint((_completeness)));
        console.log("- Clarity: %s", uint((_clarity)));
        console.log("- Originality: %s", uint((_originality)));
        console.log("- Unbiased: %s", uint((_unbiased)));
        console.log("- Plagiarism free: %s", uint((_plagiarism_free)));
        console.log(
            "- Suggested difficulty: %s",
            uint((_suggested_difficulty))
        );
        console.log("- Suggested category: %s", uint((_suggested_category)));
        console.log("- Suggested solve time: %s", _suggested_solve_time);
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

    function getChallengesByModerator(
        address _moderator_address
    ) public view returns (Challenge[] memory) {
        uint256[] memory challenge_ids = moderator_to_challenges[
            _moderator_address
        ];
        Challenge[] memory moderator_challenges = new Challenge[](
            challenge_ids.length
        );

        for (uint256 i = 0; i < challenge_ids.length; i++) {
            moderator_challenges[i] = challenges[challenge_ids[i]];
        }

        console.log(
            "User %s had fetched %s moderated challenges",
            _moderator_address,
            challenge_ids.length
        );

        return moderator_challenges;
    }

    function getModeratorReviewOfChallenge(
        uint256 challenge_id,
        address _moderator_address
    ) public view returns (ModeratorReview memory) {
        console.log(
            "User %s had fetched review of challenge #%s",
            _moderator_address,
            challenge_id
        );
        return review_pool[challenge_id].moderator_reviews[_moderator_address];
    }

    /**
     * @notice Returns the review submitted by the caller for a given challenge
     * @param _challenge_id The ID of the challenge to fetch the review for
     * @return The ModeratorReview struct for the caller
     */
    function getMyModeratorReview(uint256 _challenge_id) public view returns (ModeratorReview memory) {
        require(
            review_pool[_challenge_id].moderator_to_join_status[msg.sender],
            "You have not joined this review pool."
        );
        console.log(
            "User %s had fetched own review of challenge #%s",
            msg.sender,
            _challenge_id
        );
        return review_pool[_challenge_id].moderator_reviews[msg.sender];
    }

    function getChallengeById(
        uint256 _challenge_id
    ) public view returns (Challenge memory) {
        console.log(
            "User %s had fetched challenge #%s",
            msg.sender,
            _challenge_id
        );
        return challenges[_challenge_id];
    }

    function getJoinReviewPoolStatus(
        uint256 _challenge_id,
        address _moderator_address
    ) public view returns (bool) {
        return
            review_pool[_challenge_id].moderator_to_join_status[
                _moderator_address
            ];
    }
}
