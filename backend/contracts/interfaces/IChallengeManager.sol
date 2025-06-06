// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
        string title;
        string description;
        string[] requiredSkills;
        uint256 createdAt;
        address creator;
        bool finalized;
        uint256 totalStake;
        uint256 reviewPoolReward;
        uint256 winnerReward;
        address winner;
        uint256 difficulty;
        string category;
        uint256 duration;
        uint256 endTime;
    }

    /**
     * @dev Represents a moderator review for a challenge
     */
    struct ModeratorReview {
        uint256 challengeId;
        address moderator;
        bool approved;
        string comments;
        uint256 submittedAt;
    }

    /**
     * @dev Represents a review pool for challenges
     */
    struct ReviewPool {
        uint256 challengeId;
        address[] moderators;
        uint256 totalReward;
        bool active;
        mapping(address => bool) hasModerator;
    }

    /**
     * @dev Preview structure for joined challenges
     */
    struct JoinedChallengesPreview {
        uint256 challengeId;
        string title;
        string description;
        uint256 createdAt;
        address creator;
        bool finalized;
        uint256 totalStake;
        address winner;
        uint256 difficulty;
        string category;
        uint256 duration;
        uint256 endTime;
    }

    // ============ Events ============

    /**
     * @dev Emitted when a user contributes to a challenge
     */
    event ChallengeContributed(
        uint256 indexed challengeId,
        address indexed contributor,
        uint256 amount
    );

    /**
     * @dev Emitted when a moderator joins a review pool
     */
    event ReviewPoolJoined(
        uint256 indexed challengeId,
        address indexed moderator
    );

    /**
     * @dev Emitted when a challenge is finalized
     */
    event ChallengeFinalized(
        uint256 indexed challengeId,
        address indexed winner,
        uint256 winnerReward
    );

    /**
     * @dev Emitted when a user joins a challenge
     */
    event ChallengeJoinedByUser(
        uint256 indexed challengeId,
        address indexed user
    );

    // ============ Challenge Management Functions ============

    /**
     * @dev Contributes to a challenge with ETH
     * @param challengeId The ID of the challenge to contribute to
     */
    function contributeChallenge(uint256 challengeId) external payable;

    /**
     * @dev Allows a moderator to join a review pool
     * @param challengeId The ID of the challenge
     */
    function joinReviewPool(uint256 challengeId) external;

    /**
     * @dev Submits a moderator review for a challenge
     * @param challengeId The ID of the challenge
     * @param approved Whether the challenge is approved
     * @param comments Review comments
     */
    function submitModeratorReview(
        uint256 challengeId,
        bool approved,
        string memory comments
    ) external;

    /**
     * @dev Finalizes a challenge and distributes rewards
     * @param challengeId The ID of the challenge to finalize
     * @param winnerId The ID of the winning user
     */
    function finalizeChallenge(uint256 challengeId, uint256 winnerId) external;

    /**
     * @dev Allows a user to join a challenge
     * @param challengeId The ID of the challenge to join
     */
    function userJoinChallenge(uint256 challengeId) external;

    /**
     * @dev Marks a challenge as completed by a user
     * @param _challenge_id The ID of the challenge to mark as completed
     */
    function userCompleteChallenge(uint256 _challenge_id) external;

    // ============ View Functions ============

    /**
     * @dev Returns challenge details by ID
     * @param challengeId The ID of the challenge
     * @return Challenge struct containing challenge details
     */
    function getChallengeById(
        uint256 challengeId
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
     * @dev Returns challenges joined by a specific user
     * @param userAddress The address of the user
     * @return Array of JoinedChallengesPreview structs
     */
    function getChallengesJoinedByUser(
        address userAddress
    ) external view returns (JoinedChallengesPreview[] memory);

    /**
     * @dev Returns challenges created by a specific user
     * @param userAddress The address of the user
     * @return Array of Challenge structs for challenges created by the user
     */
    function getChallengesCreatedByUser(
        address userAddress
    ) external view returns (Challenge[] memory);

    /**
     * @dev Returns all challenges in the system
     * @return Array of all Challenge structs
     */
    function getAllChallenges() external view returns (Challenge[] memory);

    /**
     * @dev Returns moderator reviews for a specific challenge
     * @param challengeId The ID of the challenge
     * @return Array of ModeratorReview structs
     */
    function getModeratorReviewsForChallenge(
        uint256 challengeId
    ) external view returns (ModeratorReview[] memory);

    /**
     * @dev Returns the current challenge counter
     * @return The current challenge counter value
     */
    function getChallengeCounter() external view returns (uint256);

    /**
     * @dev Checks if a user has joined a specific challenge
     * @param challengeId The ID of the challenge
     * @param userAddress The address of the user
     * @return Boolean indicating if the user has joined the challenge
     */
    function hasUserJoinedChallenge(
        uint256 challengeId,
        address userAddress
    ) external view returns (bool);

    /**
     * @dev Checks if a challenge exists
     * @param challengeId The ID of the challenge
     * @return Boolean indicating if the challenge exists
     */
    function challengeExists(uint256 challengeId) external view returns (bool);

    /**
     * @dev Returns the list of users who joined a challenge
     * @param challengeId The ID of the challenge
     * @return Array of addresses of users who joined the challenge
     */
    function getChallengeParticipants(
        uint256 challengeId
    ) external view returns (address[] memory);

    /**
     * @dev Returns challenges filtered by category
     * @param category The category to filter by
     * @return Array of Challenge structs in the specified category
     */
    function getChallengesByCategory(
        string memory category
    ) external view returns (Challenge[] memory);

    /**
     * @dev Returns challenges filtered by difficulty level
     * @param difficulty The difficulty level to filter by
     * @return Array of Challenge structs with the specified difficulty
     */
    function getChallengesByDifficulty(
        uint256 difficulty
    ) external view returns (Challenge[] memory);

    /**
     * @dev Returns finalized challenges
     * @return Array of Challenge structs for finalized challenges
     */
    function getFinalizedChallenges()
        external
        view
        returns (Challenge[] memory);

    /**
     * @dev Returns the title of a challenge by its ID
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
     * @dev Returns the score deviation of a moderator's review compared to the final challenge score
     * @param _challenge_id The ID of the challenge
     * @param _moderator_address The address of the moderator
     * @return The absolute deviation between moderator's score and final quality score
     */
    function getScoreDeviationOfModeratorReview(
        uint256 _challenge_id,
        address _moderator_address
    ) external view returns (uint256);
}
