// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./SolutionManager.sol";

contract ChallengeManager {
    // ================= CONSTANTS =================
    uint256 public constant REVIEW_QUORUM = 3; // The number of moderators needed to start a finalizing process
    uint256 public constant REVIEW_THRESHOLD = 80; // The threshold of quality score for a challenge to be approved
    uint256 public constant NUMBER_OF_QUALITY_FACTORS = 7; // The number of quality factors used in the review process
    uint256 public constant MAX_DOMAIN = 14; // Maximum number of domains
    uint256 public constant MAX_DIFFICULTY_LEVEL = 3; // Maximum number of difficulty levels

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
        NO, // 0
        YES // 1
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
        uint256 quality_score;
        DifficultyLevel difficulty_level;
        uint256 solve_time;
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
        bool is_finalized;
        uint256 review_count;
        // Mapping: Moderator address -> Moderator review
        mapping(address => ModeratorReview) moderator_reviews;
        // Mapping: Moderator address -> Joined status
        mapping(address => bool) moderator_to_join_status;
    }

    // Struct for aggregated metadata
    struct AggregatedMeta {
        uint256[MAX_DIFFICULTY_LEVEL] difficulty_weight;
        uint256[MAX_DOMAIN] category_weight;
        uint256 estimated_solve_time;
    }

    // Struct for joined challenges preview in workspace
    struct JoinedChallengesPreview {
        uint256 challenge_id;
        string title_url;
        string description_url;
        Domain domain;
        SolutionProgress progress;
        uint256 joined_at;
        uint256 score;
    }

    // ================= STATE VARIABLES =================
    // Mapping: Challenge ID -> Challenge
    mapping(uint256 => Challenge) private challenges;
    // Mapping: Challenge ID -> Review Pool
    mapping(uint256 => ReviewPool) private review_pool;
    // Mapping: Contributor address -> Challenge IDs
    mapping(address => uint256[]) private contributor_to_challenges;
    // Mapping: Moderator address -> Challenge IDs
    mapping(address => uint256[]) private moderator_to_challenges;
    // Mapping: Challenge ID -> Aggregated metadata
    mapping(uint256 => AggregatedMeta) private challenge_to_aggregated_meta;
    // Mapping: User address -> Joined challenge IDs
    mapping(address => uint256[]) private user_to_joined_challenges;

    uint256 public total_challenges = 0;
    uint256 public pending_challenges = 0;
    uint256 public approved_challenges = 0;

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

    event ChallengeFinalized(
        uint256 indexed challengeId,
        ChallengeStatus status,
        uint256 averagePercent
    );

    event ChallengeJoinedByUser(
        address indexed user,
        uint256 challengeId,
        uint256 joinedAt
    );

    event SolutionSubmitted(
        address indexed user,
        uint256 challengeId,
        string solutionUrl,
        uint256 submittedAt
    );

    // ================= MODIFIER =================
    // Modifier to check if the challenge is finalized
    modifier onlyBeforeFinalized(uint256 challenge_id) {
        require(
            !review_pool[challenge_id].is_finalized,
            "Challenge already finalised"
        );
        _;
    }

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
            status: ChallengeStatus.PENDING,
            quality_score: 0,
            difficulty_level: DifficultyLevel.EASY,
            solve_time: 0
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
    function joinReviewPool(
        uint256 _challenge_id
    ) public onlyBeforeFinalized(_challenge_id) {
        // Prevent joining the review pool if maximum number of moderators is reached
        require(
            review_pool[_challenge_id].moderator_list.length < REVIEW_QUORUM,
            "Max moderators reached"
        );

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

    function submitModeratorReview(
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
    ) public onlyBeforeFinalized(_challenge_id) {
        // Check if the moderator has joined the review pool
        require(
            review_pool[_challenge_id].moderator_to_join_status[msg.sender] ==
                true,
            "You have not joined this review pool."
        );

        ReviewPool storage pool = review_pool[_challenge_id];
        // Add review_count if the moderator is submitting a review for the first time
        if (pool.moderator_reviews[msg.sender].review_time == 0) {
            pool.review_count++;
        }

        // Update the moderator's review in the review pool
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

        // Automatically finalize the review pool if the number of reviews reaches the quorum
        if (pool.review_count >= REVIEW_QUORUM) {
            finalizeChallenge(_challenge_id, pool);
        }
    }

    function finalizeChallenge(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal {
        // Check if the challenge is already finalized
        require(!_pool.is_finalized, "Challenge already finalized");

        // Calculate the average score from the moderator reviews
        uint256 total_score = 0;
        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            ModeratorReview storage review = _pool.moderator_reviews[
                _pool.moderator_list[i]
            ];
            total_score +=
                uint256(review.relevance) +
                uint256(review.technical_correctness) +
                uint256(review.completeness) +
                uint256(review.clarity) +
                uint256(review.originality) +
                uint256(review.unbiased) +
                uint256(review.plagiarism_free);
        }
        uint256 average_score = (total_score * 100) /
            (NUMBER_OF_QUALITY_FACTORS * _pool.review_count);
        console.log(
            "Average score for challenge #%s: %s",
            _challenge_id,
            average_score
        );

        // Update the challenge status based on the average score
        if (average_score >= REVIEW_THRESHOLD) {
            challenges[_challenge_id].status = ChallengeStatus.APPROVED;
            pending_challenges--;
            approved_challenges++;
        } else {
            challenges[_challenge_id].status = ChallengeStatus.REJECTED;
            pending_challenges--;
        }

        // Update the challenge quality score
        challenges[_challenge_id].quality_score = average_score;

        // Mark the review pool as finalized
        _pool.is_finalized = true;

        emit ChallengeFinalized(
            _challenge_id,
            challenges[_challenge_id].status,
            challenges[_challenge_id].quality_score
        );
    }

    function userJoinChallenge(
        address _user_address,
        uint256 _challenge_id,
        address _solution_address
    ) external {
        // Check if challenge id exists
        require(_challenge_id < total_challenges);

        SolutionManager solution_manager = SolutionManager(_solution_address);

        require(
            !solution_manager.checkUserJoinedChallenge(
                _user_address,
                _challenge_id
            )
        );

        uint256 _joined_at = block.timestamp * 1000;

        solution_manager.createSolutionBase(
            _user_address,
            _challenge_id,
            _joined_at
        );

        user_to_joined_challenges[_user_address].push(_challenge_id);

        console.log(
            "User %s joined challenge %s at %s",
            _user_address,
            _challenge_id,
            _joined_at
        );

        emit ChallengeJoinedByUser(_user_address, _challenge_id, _joined_at);
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
        uint256 count = 0;

        for (uint256 i = 0; i < total_challenges; i++) {
            if (challenges[i].status == ChallengeStatus.PENDING) {
                pendingChallengeList[count] = challenges[i];
                count++;
            }
        }

        console.log(
            "Smart contract %s had fetch %s pending challenges",
            msg.sender,
            pendingChallengeList.length
        );

        return pendingChallengeList;
    }

    function getApprovedChallenges() public view returns (Challenge[] memory) {
        Challenge[] memory approvedChallengeList = new Challenge[](
            approved_challenges
        );
        uint256 count = 0;

        for (uint256 i = 0; i < total_challenges; i++) {
            if (challenges[i].status == ChallengeStatus.APPROVED) {
                approvedChallengeList[count] = challenges[i];
                count++;
            }
        }

        console.log(
            "Smart contract %s had fetch %s approved challenges",
            msg.sender,
            approvedChallengeList.length
        );

        return approvedChallengeList;
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

    function getReviewQuorum() public pure returns (uint256) {
        return REVIEW_QUORUM;
    }

    function getReviewPoolSize(
        uint256 _challenge_id
    ) public view returns (uint256) {
        return review_pool[_challenge_id].moderator_list.length;
    }

    function getChallengeFinalizedStatus(
        uint256 _challenge_id
    ) public view returns (bool) {
        return review_pool[_challenge_id].is_finalized;
    }

    function getJoinedChallengesByUserForPreview(
        address _user_address,
        address _solution_address
    ) public view returns (JoinedChallengesPreview[] memory) {
        uint256[] memory challengeIds = user_to_joined_challenges[
            _user_address
        ];

        SolutionManager solution_manager = SolutionManager(_solution_address);

        JoinedChallengesPreview[]
            memory previewList = new JoinedChallengesPreview[](
                challengeIds.length
            );

        for (uint256 i = 0; i < challengeIds.length; i++) {
            uint256 id = challengeIds[i];
            Challenge storage ch = challenges[id];
            (
                uint256 created_at,
                SolutionProgress progress,
                uint256 score
            ) = solution_manager.getSolutionPreviewByUserAndChallengeId(
                    _user_address,
                    id
                );

            previewList[i] = JoinedChallengesPreview({
                challenge_id: id,
                title_url: ch.title_url,
                description_url: ch.description_url,
                domain: ch.category,
                progress: progress,
                joined_at: created_at,
                score: score
            });
        }

        console.log(
            "User %s had fetched preview of joined challenges",
            _user_address
        );

        return previewList;
    }

    // ================= SEEDING METHODS =================
    function seedChallenge(
        address _contributor,
        string calldata _title_url,
        string calldata _description_url,
        Domain _category,
        uint256 _contribute_at,
        ChallengeStatus _status,
        uint256 _quality_score,
        DifficultyLevel _difficulty_level,
        uint256 _solve_time
    ) external {
        uint256 challengeId = total_challenges++;

        challenges[challengeId] = Challenge({
            id: challengeId,
            contributor: _contributor,
            title_url: _title_url,
            description_url: _description_url,
            category: _category,
            contribute_at: _contribute_at,
            status: _status,
            quality_score: _quality_score,
            difficulty_level: _difficulty_level,
            solve_time: _solve_time
        });

        contributor_to_challenges[_contributor].push(challengeId);

        if (_status == ChallengeStatus.PENDING) pending_challenges++;
        else if (_status == ChallengeStatus.APPROVED) approved_challenges++;

        console.log(
            "Challenge #%s seeded by %s at %s with:",
            challengeId,
            _contributor,
            _contribute_at
        );
        console.log("- Title url        : %s", _title_url);
        console.log("- Description url  : %s", _description_url);
    }
}
