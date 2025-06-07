// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "hardhat/console.sol";
import "./interfaces/ISolutionManager.sol";
import "./interfaces/IModerationEscrow.sol";
import "./interfaces/IChallengeCostManager.sol";
import "./Constants.sol";
import "./interfaces/IReputationManager.sol";
import "./interfaces/IRoleManager.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ChallengeManager is AccessControl {
    // ================= STRUCTS =================
    struct Challenge {
        uint256 id;
        address contributor;
        string title_url;
        string description_url;
        SystemEnums.Domain category;
        uint256 contribute_at;
        SystemEnums.ChallengeStatus status;
        uint256 quality_score;
        SystemEnums.DifficultyLevel difficulty_level;
        uint256 solve_time;
        uint256 completed;
    }

    struct ModeratorReview {
        address moderator;
        uint256 challenge_id;
        uint256 review_time;
        string review_txid;
        bool is_submitted;
        SystemEnums.QualityFactorAnswer relevance;
        SystemEnums.QualityFactorAnswer technical_correctness;
        SystemEnums.QualityFactorAnswer completeness;
        SystemEnums.QualityFactorAnswer clarity;
        SystemEnums.QualityFactorAnswer originality;
        SystemEnums.QualityFactorAnswer unbiased;
        SystemEnums.QualityFactorAnswer plagiarism_free;
        SystemEnums.DifficultyLevel suggested_difficulty;
        SystemEnums.Domain suggested_category;
        uint256 suggested_solve_time;
        uint256 review_score;
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

    // Struct for joined challenges preview in workspace
    struct JoinedChallengesPreview {
        uint256 challenge_id;
        string title_url;
        string description_url;
        SystemEnums.Domain domain;
        SystemEnums.SolutionProgress progress;
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
    // Mapping: Moderator address -> Challenge I@Ds
    mapping(address => uint256[]) private moderator_to_challenges;
    // Mapping: User address -> Joined challenge IDs
    mapping(address => uint256[]) private user_to_joined_challenges;
    // Mapping: Challenge ID -> Participant addresses
    mapping(uint256 => address[]) private challenge_to_participants;
    // Mapping: Challenge ID -> Is pending
    mapping(uint256 => bool) is_pending_challenge;
    // Array of pending challenges
    uint256[] private pending_challenges;
    // Mapping: Challenge ID -> Is approved
    mapping(uint256 => bool) is_approved_challenge;
    // Array of approved challenges
    uint256[] private approved_challenges;
    IReputationManager private reputation_manager; // ReputationManager instance
    address private reputation_manager_address; // ReputationManager address
    IRoleManager private role_manager; // RoleManager instance
    address private role_manager_address; // RoleManager address
    ISolutionManager private solution_manager; // SolutionManager instance
    address private solution_manager_address; // SolutionManager address
    IModerationEscrow private moderation_escrow; // ModerationEscrow instance
    address private moderation_escrow_address; // ModerationEscrow address
    IChallengeCostManager private challenge_cost_manager; // ChallengeCostManager instance
    address private challenge_cost_manager_address; // ChallengeCostManager address

    uint256 public total_challenges = 0;

    // ================= EVENTS =================
    event ChallengeContributed(
        address indexed contributor,
        string title_url,
        string description_url,
        SystemEnums.Domain category,
        uint256 contribute_at
    );
    // Emitted when a moderator joins a review pool
    event ReviewPoolJoined(
        uint256 indexed challenge_id,
        address indexed moderator
    );

    event ChallengeFinalized(
        uint256 indexed challengeId,
        SystemEnums.ChallengeStatus status,
        uint256 averagePercent
    );

    event ChallengeJoinedByUser(
        address indexed user,
        uint256 challengeId,
        uint256 joinedAt
    );

    // ================= CONSTRUCTOR =================
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant the deployer the default admin role
    }

    // ================= MODIFIER =================
    // Modifier to check if the challenge is finalized
    modifier onlyBeforeFinalized(uint256 challenge_id) {
        require(
            !review_pool[challenge_id].is_finalized,
            "Challenge already finalised"
        );
        _;
    }

    // Modifier to check if role manager is set
    modifier onlyWithRoleManager() {
        require(address(role_manager) != address(0), "Role manager not set");
        _;
    }

    // Modifier to check if caller is a contributor
    modifier onlyContributor() {
        require(address(role_manager) != address(0), "Role manager not set");
        require(role_manager.isContributor(msg.sender), "Not a contributor");
        _;
    }

    // Modifier to check if caller is a moderator
    modifier onlyModerator() {
        require(address(role_manager) != address(0), "Role manager not set");
        require(role_manager.isModerator(msg.sender), "Not a moderator");
        _;
    }

    // ================= CONTRIBUTION METHODS =================
    function contributeChallenge(
        string calldata _title_url,
        string calldata _description_url,
        SystemEnums.Domain _category
    ) external payable onlyContributor {
        // Validate bounty amount
        if (msg.value == 0) {
            revert("Zero value");
        }

        // Ensure moderation escrow is set
        if (address(moderation_escrow) == address(0)) {
            revert("Moderation escrow not set");
        }

        uint256 challengeId = total_challenges++;
        uint256 contributeAt = block.timestamp * 1000;

        // Create a challenge
        challenges[challengeId] = Challenge({
            id: challengeId,
            contributor: msg.sender,
            title_url: _title_url,
            description_url: _description_url,
            category: _category,
            contribute_at: contributeAt,
            status: SystemEnums.ChallengeStatus.PENDING,
            quality_score: 0,
            difficulty_level: SystemEnums.DifficultyLevel.EASY,
            solve_time: 0,
            completed: 0
        });

        // Mark contributor to this challenge
        contributor_to_challenges[msg.sender].push(challengeId);

        // Mark challenge is pending
        is_pending_challenge[challengeId] = true;
        pending_challenges.push(challengeId);

        // Deposit bounty to moderation escrow
        moderation_escrow.depositBounty{value: msg.value}(
            challengeId,
            msg.sender
        );

        console.log(
            "Challenge #%s contributed by %s at %s with:",
            challengeId,
            msg.sender,
            contributeAt
        );
        console.log("- Title url        : %s", _title_url);
        console.log("- Description url  : %s", _description_url);
        console.log("- Bounty amount    : %s", msg.value);

        emit ChallengeContributed(
            msg.sender,
            _title_url,
            _description_url,
            _category,
            contributeAt
        );
    }

    // ================= MODERATION METHODS=================

    function joinReviewPool(
        uint256 _challenge_id,
        string calldata _review_txid
    ) public onlyBeforeFinalized(_challenge_id) onlyModerator {
        ReviewPool storage pool = review_pool[_challenge_id];

        // Prevent joining the review pool if maximum number of moderators is reached
        require(
            pool.moderator_list.length < SystemConsts.REVIEW_QUORUM,
            "Max moderators reached"
        );

        // Prevent duplicate joining of the same review pool
        require(
            pool.moderator_to_join_status[msg.sender] == false,
            "You have already joined this review pool."
        );

        // Prevent joining the review pool if the user is a contributor
        require(
            challenges[_challenge_id].contributor != msg.sender,
            "Contributor cannot join review pool"
        );

        // Add new challenge to the moderator's list of challenges
        moderator_to_challenges[msg.sender].push(_challenge_id);

        // Use a storage reference for cleaner access
        pool.moderator_list.push(msg.sender);
        pool.moderator_to_join_status[msg.sender] = true;

        ModeratorReview storage review = pool.moderator_reviews[msg.sender];
        review.moderator = msg.sender;
        review.challenge_id = _challenge_id;
        review.review_txid = _review_txid;

        emit ReviewPoolJoined(_challenge_id, msg.sender);
        console.log(
            "Moderator %s joined review pool for challenge #%s",
            msg.sender,
            _challenge_id
        );
    }

    function submitModeratorReview(
        uint256 _challenge_id,
        SystemEnums.QualityFactorAnswer _relevance,
        SystemEnums.QualityFactorAnswer _technical_correctness,
        SystemEnums.QualityFactorAnswer _completeness,
        SystemEnums.QualityFactorAnswer _clarity,
        SystemEnums.QualityFactorAnswer _originality,
        SystemEnums.QualityFactorAnswer _unbiased,
        SystemEnums.QualityFactorAnswer _plagiarism_free,
        SystemEnums.DifficultyLevel _suggested_difficulty,
        SystemEnums.Domain _suggested_category,
        uint256 _suggested_solve_time
    ) public payable onlyBeforeFinalized(_challenge_id) onlyModerator {
        // Validate stake amount
        if (msg.value == 0) {
            revert("Zero stake amount");
        }

        // Ensure moderation escrow is set
        if (address(moderation_escrow) == address(0)) {
            revert("Moderation escrow not set");
        }

        ReviewPool storage pool = review_pool[_challenge_id];

        // Check if the moderator has joined the review pool
        require(
            pool.moderator_to_join_status[msg.sender] == true,
            "You have not joined this review pool."
        );

        // Moderator can only submit once
        require(
            review_pool[_challenge_id]
                .moderator_reviews[msg.sender]
                .is_submitted == false,
            "You have already submitted a review."
        );

        // Call moderation escrow to stake the moderator's tokens
        moderation_escrow.stake{value: msg.value}(_challenge_id, msg.sender);

        // Increment the review count
        pool.review_count++;

        // Calculate the review score based on the quality factors
        uint256 review_score = ((uint256(_relevance) +
            uint256(_technical_correctness) +
            uint256(_completeness) +
            uint256(_clarity) +
            uint256(_originality) +
            uint256(_unbiased) +
            uint256(_plagiarism_free)) * 100) /
            SystemConsts.NUMBER_OF_QUALITY_FACTORS;

        // Update the moderator's review in the review pool
        ModeratorReview storage review = pool.moderator_reviews[msg.sender];
        review.review_time = block.timestamp;
        review.is_submitted = true;
        review.relevance = _relevance;
        review.technical_correctness = _technical_correctness;
        review.completeness = _completeness;
        review.clarity = _clarity;
        review.originality = _originality;
        review.unbiased = _unbiased;
        review.plagiarism_free = _plagiarism_free;
        review.suggested_difficulty = _suggested_difficulty;
        review.suggested_category = _suggested_category;
        review.suggested_solve_time = _suggested_solve_time;
        review.review_score = review_score;

        // Automatically finalize the review pool if the number of reviews reaches the quorum
        if (pool.review_count >= SystemConsts.REVIEW_QUORUM) {
            finalizeChallenge(_challenge_id, pool);
        }
    }

    function finalizeChallenge(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal {
        // Check if the challenge is already finalized
        require(!_pool.is_finalized, "Challenge already finalized");

        Challenge storage cl = challenges[_challenge_id];

        // Consolidate the challenge category, difficulty level and estimated solve time
        cl.category = _consolidateChallengeCategory(_challenge_id, _pool);
        console.log(
            "Final category for challenge #%s: %s",
            _challenge_id,
            uint256(challenges[_challenge_id].category)
        );

        cl.difficulty_level = _consolidateChallengeDifficulty(
            _challenge_id,
            _pool
        );
        console.log(
            "Final difficulty level for challenge #%s: %s",
            _challenge_id,
            uint256(challenges[_challenge_id].difficulty_level)
        );

        cl.solve_time = _consolidateChallengeSolveTime(_challenge_id, _pool);
        console.log(
            "Final estimated solve time for challenge #%s: %s",
            _challenge_id,
            challenges[_challenge_id].solve_time
        );

        // Consolidate average score of challenge
        uint256 average_score = _consolidateWeightedAverageScore(
            _challenge_id,
            _pool
        );

        console.log(
            "Average score for challenge #%s: %s",
            _challenge_id,
            average_score
        );

        // Update the challenge status based on the average score
        if (average_score >= SystemConsts.REVIEW_THRESHOLD) {
            cl.status = SystemEnums.ChallengeStatus.APPROVED;
            // Mark challenge is approved
            is_approved_challenge[_challenge_id] = true;
            approved_challenges.push(_challenge_id);
        } else {
            cl.status = SystemEnums.ChallengeStatus.REJECTED;
        }
        cl.quality_score = average_score;

        // Remove challenge from pending tracking
        is_pending_challenge[_challenge_id] = false;
        // Remove challenge from pending_challenges array
        for (uint256 i = 0; i < pending_challenges.length; i++) {
            if (pending_challenges[i] == _challenge_id) {
                // Replace with the last element and pop
                pending_challenges[i] = pending_challenges[
                    pending_challenges.length - 1
                ];
                pending_challenges.pop();
                break;
            }
        }

        // Mark the review pool as finalized
        _pool.is_finalized = true;

        emit ChallengeFinalized(_challenge_id, cl.status, cl.quality_score);

        // Update contributor's and moderators' reputation scores
        if (reputation_manager_address != address(0)) {
            console.log(
                "Executing reputation update for contributor of challenge #%s",
                _challenge_id
            );
            reputation_manager.updateContributionReputation(
                cl.contributor,
                cl.category,
                cl.quality_score,
                SystemConsts.THRESHOLD_OF_CHALLENGE_QUALITY_SCORE,
                SystemConsts.SCALING_CONSTANT_FOR_CONTRIBUTION,
                cl.difficulty_level
            );

            for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
                console.log(
                    "Executing reputation update for moderator %s",
                    _pool.moderator_list[i]
                );
                address moderator_address = _pool.moderator_list[i];
                ModeratorReview storage review = _pool.moderator_reviews[
                    moderator_address
                ];
                reputation_manager.updateModerationReputation(
                    moderator_address,
                    cl.category, // challenge category (have finalized), not suggested_category from review
                    cl.quality_score,
                    review.review_score,
                    SystemConsts.THRESHOLD_OF_MODERATION_DEVIATION,
                    SystemConsts.SCALING_CONSTANT_FOR_MODERATION
                );
            }
        }

        // Finalize the challenge pot in the moderation escrow
        if (moderation_escrow_address != address(0)) {
            console.log(
                "Finalizing challenge pot for challenge #%s",
                _challenge_id
            );
            moderation_escrow.finalizeChallengePot(_challenge_id);
        }
    }

    function userJoinChallenge(
        uint256 _challenge_id,
        string calldata _solution_base_txid
    ) external payable {
        // Check if challenge id exists
        require(_challenge_id < total_challenges);

        // Check if user already joined this challenge
        require(
            !solution_manager.checkUserJoinedChallenge(
                msg.sender,
                _challenge_id
            )
        );

        // Validate payment amount
        require(msg.value > 0, "Payment amount must be greater than 0");

        // Ensure ChallengeCostManager is set
        require(
            address(challenge_cost_manager) != address(0),
            "ChallengeCostManager not set"
        );

        uint256 joinAt = block.timestamp * 1000;

        // Process payment through ChallengeCostManager
        challenge_cost_manager.addTalentPayment{value: msg.value}(
            _challenge_id,
            msg.sender
        );

        solution_manager.createSolutionBase(
            msg.sender,
            _challenge_id,
            _solution_base_txid,
            joinAt
        );
        user_to_joined_challenges[msg.sender].push(_challenge_id);
        challenge_to_participants[_challenge_id].push(msg.sender);

        console.log(
            "User %s joined challenge %s at %s",
            msg.sender,
            _challenge_id,
            joinAt
        );

        emit ChallengeJoinedByUser(msg.sender, _challenge_id, joinAt);
    }

    function userCompleteChallenge(uint256 _challenge_id) external {
        // Check if challenge id exists
        require(_challenge_id < total_challenges);

        challenges[_challenge_id].completed++;
    }

    // ================= SETTER METHODS =================
    function setRoleManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        role_manager_address = _address;
        role_manager = IRoleManager(_address);
    }

    function setReputationManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        reputation_manager_address = _address;
        reputation_manager = IReputationManager(_address);
    }

    function setSolutionManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        solution_manager_address = _address;
        solution_manager = ISolutionManager(_address);
    }

    function setModerationEscrowAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        moderation_escrow_address = _address;
        moderation_escrow = IModerationEscrow(_address);
    }

    function setChallengeCostManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        challenge_cost_manager_address = _address;
        challenge_cost_manager = IChallengeCostManager(_address);
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
        uint256 count = pending_challenges.length;
        Challenge[] memory pendingChallengeList = new Challenge[](count);

        for (uint256 i = 0; i < count; i++) {
            pendingChallengeList[i] = challenges[pending_challenges[i]];
        }

        console.log(
            "Smart contract %s had fetch %s pending challenges",
            msg.sender,
            pendingChallengeList.length
        );

        return pendingChallengeList;
    }

    function getApprovedChallenges() public view returns (Challenge[] memory) {
        uint256 count = approved_challenges.length;
        Challenge[] memory approvedChallengeList = new Challenge[](count);

        for (uint256 i = 0; i < count; i++) {
            approvedChallengeList[i] = challenges[approved_challenges[i]];
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

    function getChallengeTitleById(
        uint256 _challenge_id
    ) public view returns (string memory) {
        return challenges[_challenge_id].title_url;
    }

    function getChallengeDomainById(
        uint256 _challenge_id
    ) public view returns (SystemEnums.Domain) {
        return challenges[_challenge_id].category;
    }

    function getChallengeDifficultyById(
        uint256 _challenge_id
    ) public view returns (SystemEnums.DifficultyLevel) {
        return challenges[_challenge_id].difficulty_level;
    }

    function getChallengeQualityScoreById(
        uint256 _challenge_id
    ) public view returns (uint256) {
        return challenges[_challenge_id].quality_score;
    }

    function getChallengeContributorById(
        uint256 _challenge_id
    ) public view returns (address) {
        require(_challenge_id < total_challenges, "Challenge does not exist");
        return challenges[_challenge_id].contributor;
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
        return SystemConsts.REVIEW_QUORUM;
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

    function getChallengeParticipants(
        uint256 challengeId
    ) external view returns (address[] memory) {
        return challenge_to_participants[challengeId];
    }

    function getJoinedChallengesByUserForPreview(
        address _user_address
    ) public view returns (JoinedChallengesPreview[] memory) {
        require(
            solution_manager_address != address(0),
            "SolutionManager not set"
        );
        uint256[] memory challengeIds = user_to_joined_challenges[
            _user_address
        ];

        JoinedChallengesPreview[]
            memory previewList = new JoinedChallengesPreview[](
                challengeIds.length
            );

        for (uint256 i = 0; i < challengeIds.length; i++) {
            uint256 id = challengeIds[i];
            Challenge storage cl = challenges[id];
            (
                uint256 created_at,
                SystemEnums.SolutionProgress progress,
                uint256 score
            ) = solution_manager.getSolutionPreviewByUserAndChallengeId(
                    _user_address,
                    id
                );

            previewList[i] = JoinedChallengesPreview({
                challenge_id: id,
                title_url: cl.title_url,
                description_url: cl.description_url,
                domain: cl.category,
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

    function getModeratorReviewTxId(
        address _moderator_address,
        uint256 _challenge_id
    ) public view returns (string memory) {
        // Moderator must have joined the review pool
        require(
            review_pool[_challenge_id].moderator_to_join_status[
                _moderator_address
            ],
            "Moderator has not joined the review pool"
        );

        return
            review_pool[_challenge_id]
                .moderator_reviews[_moderator_address]
                .review_txid;
    }

    function getScoreDeviationOfModeratorReview(
        uint256 _challenge_id,
        address _moderator_address
    ) public view returns (uint256) {
        // Validate that the challenge exists
        require(_challenge_id < total_challenges, "Challenge does not exist");

        // Moderator must have joined the review pool
        require(
            review_pool[_challenge_id].moderator_to_join_status[
                _moderator_address
            ],
            "Moderator has not joined the review pool"
        );

        // Get the moderator's review score
        uint256 moderator_score = review_pool[_challenge_id]
            .moderator_reviews[_moderator_address]
            .review_score;

        // Get the challenge's final quality score
        uint256 final_quality_score = challenges[_challenge_id].quality_score;

        // Calculate and return the absolute deviation
        if (moderator_score >= final_quality_score) {
            return moderator_score - final_quality_score;
        } else {
            return final_quality_score - moderator_score;
        }
    }

    // ================= SEEDING METHODS =================
    function seedChallenge(
        address _contributor,
        string calldata _title_url,
        string calldata _description_url,
        SystemEnums.Domain _category,
        uint256 _contribute_at,
        SystemEnums.ChallengeStatus _status,
        uint256 _quality_score,
        SystemEnums.DifficultyLevel _difficulty_level,
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
            solve_time: _solve_time,
            completed: 0
        });

        contributor_to_challenges[_contributor].push(challengeId);

        if (_status == SystemEnums.ChallengeStatus.PENDING) {
            is_pending_challenge[challengeId] = true;
            pending_challenges.push(challengeId);
        } else if (_status == SystemEnums.ChallengeStatus.APPROVED) {
            is_approved_challenge[challengeId] = true;
            approved_challenges.push(challengeId);
        }

        console.log(
            "Challenge #%s seeded by %s at %s with:",
            challengeId,
            _contributor,
            _contribute_at
        );
        console.log("- Title url        : %s", _title_url);
        console.log("- Description url  : %s", _description_url);
    }

    // ================== INTERNAL METHODS =================

    /**
     * @dev Computes a reputation weight based on domain reputation
     * @param domain_reputation The domain-specific reputation score of a moderator
     * @return The calculated reputation weight used for weighted average scoring
     *
     * The weight is calculated using a logarithmic scale to prevent
     * participants with very high reputation from dominating the scoring.
     * Base weight constant is added to ensure minimum influence.
     *
     * The mathematical formula used:
     * $W = W_{base} + \log_2(W_{base} + R_{domain})$
     *
     * Where:
     * - $W$ is the final reputation weight
     * - $W_{base}$ is the base reputation weight constant (bootstrap weight)
     * - $R_{domain}$ is the domain-specific reputation score
     */
    function _computeReputationWeight(
        int256 domain_reputation
    ) internal pure returns (uint256) {
        uint256 reputation_weight = SystemConsts.REPUTATION_WEIGHT_FOR_SCORING +
            Math.log2(
                SystemConsts.REPUTATION_WEIGHT_FOR_SCORING +
                    uint256(domain_reputation)
            );
        return reputation_weight;
    }

    /**
     * @dev Consolidates the final category (domain) for a challenge based on moderator suggestions
     * @param _challenge_id The ID of the challenge being reviewed
     * @param _pool The review pool containing moderator reviews
     * @return The final determined category for the challenge
     *
     * The function uses a weighted voting system where each moderator's vote is weighted
     * by their reputation in the specific domain they suggested. A category is selected
     * if it receives a supermajority of the weighted votes (more than 50% of total weight).
     * If no category achieves a supermajority, the original category suggested by the
     * contributor is maintained.
     */
    function _consolidateChallengeCategory(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal view returns (SystemEnums.Domain) {
        SystemEnums.Domain final_category = challenges[_challenge_id].category; // Default to contributor's suggested category
        uint256[] memory accumulated_weights = new uint256[](
            SystemConsts.N_DOMAIN
        );
        uint256 total_weight_sum = 0;

        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            address moderator = _pool.moderator_list[i];
            ModeratorReview storage review = _pool.moderator_reviews[moderator];
            int256 moderator_domain_reputation = reputation_manager
                .getDomainReputation(
                    moderator,
                    review.suggested_category // Moderator suggested category
                );
            require(
                moderator_domain_reputation >= 0,
                "ERROR: Negative domain reputation"
            );
            uint256 weight = _computeReputationWeight(
                moderator_domain_reputation
            );
            accumulated_weights[uint256(review.suggested_category)] += weight;
            total_weight_sum += weight;
        }

        for (uint256 i = 0; i < accumulated_weights.length; i++) {
            if (accumulated_weights[i] * 2 > total_weight_sum) {
                final_category = SystemEnums.Domain(i);
            }
        }

        return final_category;
    }

    /**
     * @dev Consolidates the final difficulty level for a challenge based on moderator suggestions
     * @param _challenge_id The ID of the challenge being reviewed
     * @param _pool The review pool containing moderator reviews
     * @return The final determined difficulty level for the challenge
     *
     * The function uses a weighted voting system where each moderator's vote is weighted
     * by their reputation in the challenge's domain. The final difficulty level is selected
     * based on which difficulty level received the highest weighted vote total.
     *
     * Algorithm:
     * 1. Start with the challenge's default difficulty level
     * 2. Accumulate weighted votes for each suggested difficulty level
     * 3. For each moderator:
     *    - Get their domain reputation for the challenge's category
     *    - Calculate their reputation weight
     *    - Add the weight to their suggested difficulty level
     * 4. Select the difficulty level with the highest accumulated weight
     */
    function _consolidateChallengeDifficulty(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal view returns (SystemEnums.DifficultyLevel) {
        SystemEnums.DifficultyLevel final_difficulty = challenges[_challenge_id]
            .difficulty_level;
        uint256[] memory accumulated_weights = new uint256[](
            SystemConsts.N_DIFFICULTY_LEVEL
        );

        // Accumulate weights for each suggested difficulty
        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            address moderator = _pool.moderator_list[i];
            ModeratorReview storage review = _pool.moderator_reviews[moderator];
            int256 domainRep = reputation_manager.getDomainReputation(
                moderator,
                challenges[_challenge_id].category // Aggregated challenge category
            );
            require(domainRep >= 0, "ERROR: Negative domain reputation");
            uint256 weight = _computeReputationWeight(domainRep);
            accumulated_weights[uint256(review.suggested_difficulty)] += weight;
        }

        for (uint256 i = 0; i < SystemConsts.N_DIFFICULTY_LEVEL; i++) {
            if (
                accumulated_weights[i] >
                accumulated_weights[uint256(final_difficulty)]
            ) {
                final_difficulty = SystemEnums.DifficultyLevel(i);
            }
        }

        return final_difficulty;
    }

    /**
     * @dev Calculates the weighted average score from moderator reviews for a challenge
     * @param _challenge_id The ID of the challenge being reviewed
     * @param _pool The review pool containing moderator reviews
     * @return The weighted average score
     */
    function _consolidateWeightedAverageScore(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal view returns (uint256) {
        uint256 total_weighted_score = 0;
        uint256 total_weight = 0;
        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            ModeratorReview storage review = _pool.moderator_reviews[
                _pool.moderator_list[i]
            ];
            int256 moderator_domain_reputation = reputation_manager
                .getDomainReputation(
                    review.moderator,
                    challenges[_challenge_id].category // Aggregated challenge category
                );
            uint256 reputation_weight = _computeReputationWeight(
                moderator_domain_reputation
            );
            total_weighted_score += review.review_score * reputation_weight;
            total_weight += reputation_weight;
        }
        if (total_weight == 0) {
            return 0;
        }
        return total_weighted_score / total_weight;
    }

    /**
     * @dev Consolidates the final estimated solve time for a challenge based on moderator suggestions
     * @param _challenge_id The ID of the challenge being reviewed
     * @param _pool The review pool containing moderator reviews
     * @return The weighted average of suggested solve times
     *
     * Aggregates moderator suggested solve times weighted by their domain reputation.
     */
    function _consolidateChallengeSolveTime(
        uint256 _challenge_id,
        ReviewPool storage _pool
    ) internal view returns (uint256) {
        uint256 total_weighted_time = 0;
        uint256 total_weight = 0;
        // Use the aggregated category for reputation lookup
        SystemEnums.Domain category = challenges[_challenge_id].category;

        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            address moderator = _pool.moderator_list[i];
            ModeratorReview storage review = _pool.moderator_reviews[moderator];
            int256 moderator_domain_reputation = reputation_manager
                .getDomainReputation(moderator, category);
            require(
                moderator_domain_reputation >= 0,
                "ERROR: Negative domain reputation"
            );
            uint256 weight = _computeReputationWeight(
                moderator_domain_reputation
            );
            total_weighted_time += weight * review.suggested_solve_time;
            total_weight += weight;
        }

        if (total_weight == 0) {
            return 0;
        }
        return total_weighted_time / total_weight;
    }
}
