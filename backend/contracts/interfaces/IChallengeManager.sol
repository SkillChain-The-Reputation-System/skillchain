// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../Constants.sol";

/**
 * @title IChallengeManager
 * @dev Interface for the ChallengeManager contract
 * @notice Defines the structure and functions for managing challenges in the system
 */
interface IChallengeManager {
    // ============ Structs ============

    /**
     * @dev Represents a challenge in the system
     */
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

    /**
     * @dev Represents a moderator review for a challenge
     */
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

    /**
     * @dev Preview structure for joined challenges
     */
    struct JoinedChallengesPreview {
        uint256 challenge_id;
        string title_url;
        string description_url;
        SystemEnums.Domain domain;
        SystemEnums.SolutionProgress progress;
        uint256 joined_at;
        uint256 score;
    } // ============ Events ============

    /**
     * @dev Emitted when a challenge is contributed
     */
    event ChallengeContributed(
        address indexed contributor,
        string title_url,
        string description_url,
        SystemEnums.Domain category,
        uint256 contribute_at
    );

    /**
     * @dev Emitted when a moderator joins a review pool
     */
    event ReviewPoolJoined(
        uint256 indexed challenge_id,
        address indexed moderator
    );

    /**
     * @dev Emitted when a challenge is finalized
     */
    event ChallengeFinalized(
        uint256 indexed challengeId,
        SystemEnums.ChallengeStatus status,
        uint256 averagePercent
    );

    /**
     * @dev Emitted when a user joins a challenge
     */
    event ChallengeJoinedByUser(
        address indexed user,
        uint256 challengeId,
        uint256 joinedAt
    ); 
    
    // ============ Challenge Management Functions ============

    /**
     * @dev Creates a new challenge contribution
     * @param _title_url The URL for the challenge title
     * @param _description_url The URL for the challenge description
     * @param _category The domain/category of the challenge
     */
    function contributeChallenge(
        string calldata _title_url,
        string calldata _description_url,
        SystemEnums.Domain _category
    ) external payable;

    /**
     * @dev Allows a moderator to join a review pool
     * @param _challenge_id The ID of the challenge
     * @param _review_txid The transaction ID for the review
     */
    function joinReviewPool(
        uint256 _challenge_id,
        string calldata _review_txid
    ) external;

    /**
     * @dev Submits a moderator review for a challenge
     * @param _challenge_id The ID of the challenge
     * @param _relevance Quality factor: relevance
     * @param _technical_correctness Quality factor: technical correctness
     * @param _completeness Quality factor: completeness
     * @param _clarity Quality factor: clarity
     * @param _originality Quality factor: originality
     * @param _unbiased Quality factor: unbiased
     * @param _plagiarism_free Quality factor: plagiarism free
     * @param _suggested_difficulty Suggested difficulty level
     * @param _suggested_category Suggested category
     * @param _suggested_solve_time Suggested solve time
     */
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
    ) external payable;

    /**
     * @dev Allows a user to join a challenge
     * @param _challenge_id The ID of the challenge to join
     * @param _solution_base_txid The transaction ID for the solution base
     */
    function userJoinChallenge(
        uint256 _challenge_id,
        string calldata _solution_base_txid
    ) external;

    /**
     * @dev Marks a challenge as completed by a user
     * @param _challenge_id The ID of the challenge to mark as completed
     */
    function userCompleteChallenge(uint256 _challenge_id) external; 
    
    // ============ Setter Functions ============

    /**
     * @dev Sets the role manager address
     * @param _address The address of the role manager contract
     */
    function setRoleManagerAddress(address _address) external;

    /**
     * @dev Sets the reputation manager address
     * @param _address The address of the reputation manager contract
     */
    function setReputationManagerAddress(address _address) external;

    /**
     * @dev Sets the solution manager address
     * @param _address The address of the solution manager contract
     */
    function setSolutionManagerAddress(address _address) external;

    /**
     * @dev Sets the moderation escrow address
     * @param _address The address of the moderation escrow contract
     */
    function setModerationEscrowAddress(address _address) external;

    // ============ View Functions ============

    /**
     * @dev Returns challenge details by ID
     * @param _challenge_id The ID of the challenge
     * @return Challenge struct containing challenge details
     */
    function getChallengeById(
        uint256 _challenge_id
    ) external view returns (Challenge memory);

    /**
     * @dev Returns all pending challenges
     * @return Array of Challenge structs for pending challenges
     */
    function getPendingChallenges() external view returns (Challenge[] memory);

    /**
     * @dev Returns all approved challenges
     * @return Array of Challenge structs for approved challenges
     */
    function getApprovedChallenges() external view returns (Challenge[] memory);

    /**
     * @dev Returns challenges contributed by a specific user
     * @param _contributor_address The address of the contributor
     * @return Array of Challenge structs for challenges contributed by the user
     */
    function getChallengesByContributor(
        address _contributor_address
    ) external view returns (Challenge[] memory);

    /**
     * @dev Returns challenges moderated by a specific user
     * @param _moderator_address The address of the moderator
     * @return Array of Challenge structs for challenges moderated by the user
     */
    function getChallengesByModerator(
        address _moderator_address
    ) external view returns (Challenge[] memory);

    /**
     * @dev Returns the moderator review for a specific challenge and moderator
     * @param challenge_id The ID of the challenge
     * @param _moderator_address The address of the moderator
     * @return ModeratorReview struct containing the review details
     */
    function getModeratorReviewOfChallenge(
        uint256 challenge_id,
        address _moderator_address
    ) external view returns (ModeratorReview memory);

    /**
     * @dev Returns the title URL of a challenge by its ID
     * @param _challenge_id The ID of the challenge
     * @return The title URL of the challenge
     */
    function getChallengeTitleById(
        uint256 _challenge_id
    ) external view returns (string memory);

    /**
     * @dev Returns the domain/category of a challenge by its ID
     * @param _challenge_id The ID of the challenge
     * @return The domain of the challenge
     */
    function getChallengeDomainById(
        uint256 _challenge_id
    ) external view returns (SystemEnums.Domain);

    /**
     * @dev Returns the difficulty level of a challenge by its ID
     * @param _challenge_id The ID of the challenge
     * @return The difficulty level of the challenge
     */
    function getChallengeDifficultyById(
        uint256 _challenge_id
    ) external view returns (SystemEnums.DifficultyLevel);

    /**
     * @dev Returns the quality score of a challenge by its ID
     * @param _challenge_id The ID of the challenge
     * @return The quality score of the challenge
     */
    function getChallengeQualityScoreById(
        uint256 _challenge_id
    ) external view returns (uint256);

    /**
     * @dev Returns the contributor address of a challenge by its ID
     * @param _challenge_id The ID of the challenge
     * @return The contributor address of the challenge
     */
    function getChallengeContributorById(
        uint256 _challenge_id
    ) external view returns (address);

    /**
     * @dev Returns whether a moderator has joined a specific challenge's review pool
     * @param _challenge_id The ID of the challenge
     * @param _moderator_address The address of the moderator
     * @return Boolean indicating if the moderator has joined the review pool
     */
    function getJoinReviewPoolStatus(
        uint256 _challenge_id,
        address _moderator_address
    ) external view returns (bool);

    /**
     * @dev Returns the review quorum constant
     * @return The review quorum value
     */
    function getReviewQuorum() external pure returns (uint256);

    /**
     * @dev Returns the size of the review pool for a challenge
     * @param _challenge_id The ID of the challenge
     * @return The number of moderators in the review pool
     */
    function getReviewPoolSize(
        uint256 _challenge_id
    ) external view returns (uint256);

    /**
     * @dev Returns whether a challenge has been finalized
     * @param _challenge_id The ID of the challenge
     * @return Boolean indicating if the challenge is finalized
     */
    function getChallengeFinalizedStatus(
        uint256 _challenge_id
    ) external view returns (bool);

    /**
     * @dev Returns the list of users who joined a challenge
     * @param challengeId The ID of the challenge
     * @return Array of addresses of users who joined the challenge
     */
    function getChallengeParticipants(
        uint256 challengeId
    ) external view returns (address[] memory);

    /**
     * @dev Returns joined challenges preview for a specific user
     * @param _user_address The address of the user
     * @return Array of JoinedChallengesPreview structs
     */
    function getJoinedChallengesByUserForPreview(
        address _user_address
    ) external view returns (JoinedChallengesPreview[] memory);

    /**
     * @dev Returns the review transaction ID for a moderator and challenge
     * @param _moderator_address The address of the moderator
     * @param _challenge_id The ID of the challenge
     * @return The review transaction ID
     */
    function getModeratorReviewTxId(
        address _moderator_address,
        uint256 _challenge_id
    ) external view returns (string memory);

    /**
     * @dev Returns the score deviation of a moderator's review compared to the final challenge score
     * @param _challenge_id The ID of the challenge
     * @param _moderator_address The address of the moderator
     * @return The absolute deviation between moderator's score and final quality score
     */
    function getScoreDeviationOfModeratorReview(
        uint256 _challenge_id,
        address _moderator_address
    ) external view returns (uint256);

    // ============ Seeding Functions ============

    /**
     * @dev Seeds a challenge with predefined data (for testing/initialization)
     * @param _contributor The address of the contributor
     * @param _title_url The title URL
     * @param _description_url The description URL
     * @param _category The challenge category
     * @param _contribute_at The contribution timestamp
     * @param _status The challenge status
     * @param _quality_score The quality score
     * @param _difficulty_level The difficulty level
     * @param _solve_time The solve time
     */
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
    ) external;

    // ============ State Variables ============

    /**
     * @dev Returns the total number of challenges
     * @return The total challenge count
     */
    function total_challenges() external view returns (uint256);
}
