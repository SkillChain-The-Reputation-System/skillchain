// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IModerationEscrow
 * @dev Interface for the ModerationEscrow contract
 * @dev Manages bounty deposits, moderator stakes, and reward distribution for challenge moderations
 */
interface IModerationEscrow {
    // ============================== EVENTS ==============================
    
    /**
     * @dev Emitted when a bounty is deposited for a challenge
     * @param challenge_id The ID of the challenge
     * @param contributor The address of the contributor who deposited the bounty
     * @param amount The amount of bounty deposited
     */
    event BountyDeposited(
        uint256 indexed challenge_id,
        address contributor,
        uint256 amount
    );

    /**
     * @dev Emitted when a moderator stakes tokens for a challenge
     * @param challenge_id The ID of the challenge
     * @param moderator The address of the moderator who staked
     * @param amount The amount staked
     */
    event Staked(
        uint256 indexed challenge_id,
        address moderator,
        uint256 amount
    );

    /**
     * @dev Emitted when rewards are distributed for a challenge
     * @param challenge_id The ID of the challenge
     * @param total_reward The total reward amount distributed
     */
    event RewardsDistributed(
        uint256 indexed challenge_id,
        uint256 total_reward
    );

    // ============================== CONTRIBUTOR FLOW ==============================

    /**
     * @dev Contributor deposits bounty for a challenge (native token only)
     * @param _challenge_id The ID of the challenge
     * @notice This function must be called once the challenge is created (contributed), called by ChallengeManager
     */
    function depositBounty(
        uint256 _challenge_id,
        address _contributor
    ) external payable;

    // ============================== MODERATOR FLOW ==============================

    /**
     * @dev Moderator stakes native token when opting in to review pool
     * @param _challenge_id The ID of the challenge
     * @notice This function should be called when a moderator submits their review for a challenge
     */
    function stake(
        uint256 _challenge_id,
        address _moderator
    ) external payable;

    // ============================== FINALIZATION & PAY-OUT ==============================

    /**
     * @dev Finalizes the challenge pot and distributes rewards
     * @param _challenge_id The ID of the challenge
     * @notice Can only be called by ChallengeManager after the challenge is finalized
     */
    function finalizeChallengePot(uint256 _challenge_id) external;

    // ============================== VIEW FUNCTIONS ==============================

    /**
     * @dev Get the bounty amount for a challenge
     * @param _challenge_id The challenge ID
     * @return The bounty amount
     */
    function getBounty(uint256 _challenge_id) external view returns (uint256);

    /**
     * @dev Get the total reward for a challenge
     * @param _challenge_id The challenge ID
     * @return The total reward amount
     */
    function getTotalReward(
        uint256 _challenge_id
    ) external view returns (uint256);

    /**
     * @dev Get the stake amount for a moderator in a challenge
     * @param _challenge_id The challenge ID
     * @param moderator The moderator address
     * @return The stake amount
     */
    function getModeratorStake(
        uint256 _challenge_id,
        address moderator
    ) external view returns (uint256);

    /**
     * @dev Get the reward amount for a moderator in a challenge
     * @param _challenge_id The challenge ID
     * @param moderator The moderator address
     * @return The reward amount
     */
    function getModeratorReward(
        uint256 _challenge_id,
        address moderator
    ) external view returns (uint256);

    /**
     * @dev Get the penalty amount for a moderator in a challenge
     * @param _challenge_id The challenge ID
     * @param moderator The moderator address
     * @return The penalty amount
     */
    function getModeratorPenalty(
        uint256 _challenge_id,
        address moderator
    ) external view returns (uint256);

    /**
     * @dev Check if rewards have been distributed for a challenge
     * @param _challenge_id The challenge ID
     * @return True if rewards have been distributed
     */
    function isDistributed(uint256 _challenge_id) external view returns (bool);

    /**
     * @dev Get the list of moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of moderator addresses
     */
    function getModerators(
        uint256 _challenge_id
    ) external view returns (address[] memory);

    /**
     * @dev Get the list of passed moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of passed moderator addresses
     */
    function getPassedModerators(
        uint256 _challenge_id
    ) external view returns (address[] memory);

    /**
     * @dev Get the list of failed moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of failed moderator addresses
     */
    function getFailedModerators(
        uint256 _challenge_id
    ) external view returns (address[] memory);

    // ============================== SETTER METHODS ==============================

    /**
     * @dev Set the ChallengeManager address
     * @param _address The address of the ChallengeManager contract
     * @notice Only admin can set the ChallengeManager address
     */
    function setChallengeManagerAddress(address _address) external;

    // ============================== ROLE MANAGEMENT ==============================

    /**
     * @dev Grant CHALLENGE_MANAGER_ROLE to an address
     * @param account The address to grant the role to
     */
    function grantChallengeManagerRole(address account) external;

    /**
     * @dev Revoke CHALLENGE_MANAGER_ROLE from an address
     * @param account The address to revoke the role from
     */
    function revokeChallengeManagerRole(address account) external;
}
