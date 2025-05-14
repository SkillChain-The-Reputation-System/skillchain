// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./SolutionManager.sol";
import "./Constants.sol";
import "./ReputationManager.sol";

contract ChallengeManager {
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
    }

    struct ModeratorReview {
        address moderator;
        uint256 challenge_id;
        uint256 review_time;
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
    // Mapping: Moderator address -> Challenge IDs
    mapping(address => uint256[]) private moderator_to_challenges;
    // Mapping: User address -> Joined challenge IDs
    mapping(address => uint256[]) private user_to_joined_challenges;

    ReputationManager private reputation_manager; // ReputationManager instance
    address private reputation_manager_address; // ReputationManager address

    uint256 public total_challenges = 0;
    uint256 public pending_challenges = 0;
    uint256 public approved_challenges = 0;

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
        SystemEnums.Domain _category,
        uint256 _contribute_at
    ) external {
        uint256 challengeId = total_challenges++;
        uint256 contributeAt = block.timestamp * 1000;

        challenges[challengeId] = Challenge({
            id: challengeId,
            contributor: msg.sender,
            title_url: _title_url,
            description_url: _description_url,
            category: _category,
            contribute_at: _contribute_at,
            status: SystemEnums.ChallengeStatus.PENDING,
            quality_score: 0,
            difficulty_level: SystemEnums.DifficultyLevel.EASY,
            solve_time: 0
        });

        contributor_to_challenges[msg.sender].push(challengeId);
        pending_challenges++;

        console.log(
            "Challenge #%s contributed by %s at %s with:",
            challengeId,
            msg.sender,
            contributeAt
        );
        console.log("- Title url        : %s", _title_url);
        console.log("- Description url  : %s", _description_url);

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
        uint256 _challenge_id
    ) public onlyBeforeFinalized(_challenge_id) {
        // Prevent joining the review pool if maximum number of moderators is reached
        require(
            review_pool[_challenge_id].moderator_list.length <
                SystemConsts.REVIEW_QUORUM,
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
            suggested_solve_time: _suggested_solve_time,
            review_score: review_score
        });

        // console.log(
        //     "Moderator %s updated review for challenge #%s",
        //     msg.sender,
        //     _challenge_id
        // );
        // console.log("- Relevance: %s", uint((_relevance)));
        // console.log(
        //     "- Technical correctness: %s",
        //     uint((_technical_correctness))
        // );
        // console.log("- Completeness: %s", uint((_completeness)));
        // console.log("- Clarity: %s", uint((_clarity)));
        // console.log("- Originality: %s", uint((_originality)));
        // console.log("- Unbiased: %s", uint((_unbiased)));
        // console.log("- Plagiarism free: %s", uint((_plagiarism_free)));
        // console.log(
        //     "- Suggested difficulty: %s",
        //     uint((_suggested_difficulty))
        // );
        // console.log("- Suggested category: %s", uint((_suggested_category)));
        // console.log("- Suggested solve time: %s", _suggested_solve_time);

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

        // Calculate the average score from the moderator reviews
        uint256 total_score = 0;
        for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
            ModeratorReview storage review = _pool.moderator_reviews[
                _pool.moderator_list[i]
            ];
            total_score += review.review_score;
        }
        uint256 average_score = total_score / _pool.review_count;

        console.log(
            "Average score for challenge #%s: %s",
            _challenge_id,
            average_score
        );

        // Update the challenge status based on the average score
        if (average_score >= SystemConsts.REVIEW_THRESHOLD) {
            challenges[_challenge_id].status = SystemEnums
                .ChallengeStatus
                .APPROVED;
            pending_challenges--;
            approved_challenges++;
        } else {
            challenges[_challenge_id].status = SystemEnums
                .ChallengeStatus
                .REJECTED;
            pending_challenges--;
        }

        // Update the challenge quality score
        challenges[_challenge_id].quality_score = average_score;

        // Mark the review pool as finalized
        _pool.is_finalized = true;

        // TODO: Update the challenge's difficulty level and solve time based on the moderator's suggestions

        emit ChallengeFinalized(
            _challenge_id,
            challenges[_challenge_id].status,
            challenges[_challenge_id].quality_score
        );

        // Update contributor's and moderators' reputation scores
        if (reputation_manager_address != address(0)) {
            Challenge storage challenge_data = challenges[_challenge_id];
            reputation_manager.updateContributionReputation(
                challenge_data.contributor,
                challenge_data.category,
                challenge_data.quality_score,
                SystemConsts.THRESHOLD_OF_CHALLENGE_QUALITY_SCORE, 
                SystemConsts.SCALING_CONSTANT_FOR_CONTRIBUTION, 
                challenge_data.difficulty_level
            );

            for (uint256 i = 0; i < _pool.moderator_list.length; i++) {
                address moderator_address = _pool.moderator_list[i];
                ModeratorReview storage review = _pool.moderator_reviews[
                    moderator_address
                ];
                reputation_manager.updateModerationReputation(
                    moderator_address,
                    challenge_data.category, // challenge category (have finalized), not suggested_category from review
                    challenge_data.quality_score,
                    review.review_score,
                    SystemConsts.THRESHOLD_OF_MODERATION_DEVIATION,
                    SystemConsts.SCALING_CONSTANT_FOR_MODERATION
                );
            }
        }
    }

    function userJoinChallenge(
        uint256 _challenge_id,
        string calldata _solution_base_txid,
        address _solution_address
    ) external {
        // Check if challenge id exists
        require(_challenge_id < total_challenges);

        SolutionManager solution_manager = SolutionManager(_solution_address);

        require(
            !solution_manager.checkUserJoinedChallenge(
                msg.sender,
                _challenge_id
            )
        );

        uint256 _joined_at = block.timestamp * 1000;

        solution_manager.createSolutionBase(
            msg.sender,
            _challenge_id,
            _solution_base_txid,
            _joined_at
        );

        user_to_joined_challenges[msg.sender].push(_challenge_id);

        console.log(
            "User %s joined challenge %s at %s",
            msg.sender,
            _challenge_id,
            _joined_at
        );

        emit ChallengeJoinedByUser(msg.sender, _challenge_id, _joined_at);
    }

    // ================= SETTER METHODS =================
    function setReputationManagerAddress(address _address) external {
        // TODO: Add access control (e.g., only owner)
        require(_address != address(0), "Invalid address");
        reputation_manager_address = _address;
        reputation_manager = ReputationManager(_address);
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
            if (challenges[i].status == SystemEnums.ChallengeStatus.PENDING) {
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
            if (challenges[i].status == SystemEnums.ChallengeStatus.APPROVED) {
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
                SystemEnums.SolutionProgress progress,
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
            solve_time: _solve_time
        });

        contributor_to_challenges[_contributor].push(challengeId);

        if (_status == SystemEnums.ChallengeStatus.PENDING)
            pending_challenges++;
        else if (_status == SystemEnums.ChallengeStatus.APPROVED)
            approved_challenges++;

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
