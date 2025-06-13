// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IChallengeManager.sol";
import "./Formulas.sol";
import "./Constants.sol";
import "./interfaces/IReputationManager.sol";

contract ModerationEscrow is AccessControl {
    /* ============================= ROLE CONSTANTS ============================= */
    bytes32 public constant CHALLENGE_MANAGER_ROLE =
        keccak256("CHALLENGE_MANAGER_ROLE");

    /* ============================= CONSTRUCTOR ============================= */
    constructor() {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /* ============================= Events ============================= */
    event BountyDeposited(
        bytes32 indexed challenge_id,
        address contributor,
        uint256 amount
    );
    event RewardsDistributed(
        bytes32 indexed challenge_id,
        uint256 total_reward
    );

    /* ============================= STRUCTS ============================= */
    struct Pot {
        uint256 bounty; // Total bounty put up by contributor(s)
        address contributor; // Address of the contributor who funded the bounty
        uint256 total_reward; // Total reward = bounty amount
        mapping(address => uint256) moderator_reward; // Mapping: moderator address => reward amount
        mapping(address => uint256) moderator_deviation; // Mapping: moderator address => deviation between their quality score the gave and the finalized score of challenge.
        address[] moderators; // List of moderators who join review pool of this this challenge
        address[] passed_moderators; // List of moderators who passed the challenge (deviation <= DEVIATION_THRESHOLD)
        address[] failed_moderators; // List of moderators who failed the challenge (deviation > DEVIATION_THRESHOLD)
        bool is_distributed; // Flag to check if rewards have been distributed
    }

    /* ============================= STATE VARIABLES ============================= */
    mapping(bytes32 challenge_id => Pot) private pots;

    IChallengeManager private challenge_manager; // IChallengeManager instance
    address private challenge_manager_address; // ChallengeManager address
    IReputationManager private reputation_manager; // ReputationManager instance
    address private reputation_manager_address; // ReputationManager address

    /* ============================= CONTRIBUTOR FLOW ============================= */ /// @dev Contributor deposits bounty for a challenge (native token only).
    //TODO: This function must be called once the challenge is created (contributed), called by ChallengeManager
    function depositBounty(
        bytes32 _challenge_id,
        address _contributor
    ) external payable onlyRole(CHALLENGE_MANAGER_ROLE) {
        if (msg.value == 0) {
            revert("ZeroValue");
        }

        Pot storage pot = pots[_challenge_id];

        if (pot.bounty > 0) {
            revert("ContributorAlreadyFunded");
        }

        pot.bounty = msg.value;
        pot.total_reward = msg.value; // Initialize total reward with the bounty amount
        pot.contributor = _contributor;

        emit BountyDeposited(_challenge_id, _contributor, msg.value);
    } /* ============================= MODERATOR FLOW ============================ */

    /// @dev Sync moderators by copying the entire moderator list from ChallengeManager's ReviewPool
    function syncModeratorsFromReviewPool(
        bytes32 _challenge_id
    ) external onlyRole(CHALLENGE_MANAGER_ROLE) {
        if (challenge_manager_address == address(0)) {
            revert("ChallengeManagerNotSet");
        }

        Pot storage pot = pots[_challenge_id];

        // Get the complete moderator list from ChallengeManager's ReviewPool
        address[] memory reviewPoolModerators = challenge_manager
            .getReviewPoolModerators(_challenge_id);

        // Copy the entire moderator list (replacing the current list)
        pot.moderators = reviewPoolModerators;
    }

    // TODO: Add access control to this function, can only be called by ChallengeManager after the challenge is finalized
    function finalizeChallengePot(
        bytes32 _challenge_id
    ) external onlyRole(CHALLENGE_MANAGER_ROLE) {
        Pot storage pot = pots[_challenge_id];

        if (pot.is_distributed == true) {
            revert("AlreadyDistributed");
        }

        _calculateDeviation(_challenge_id);
        _calculateReward(_challenge_id);
        _distributeRewards(_challenge_id);
    }

    /* ============================= VIEWS ============================= */

    // ================= SETTER METHODS =================
    // TODO: Add access control to this function, only admin can set the ChallengeManager address
    function setChallengeManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_address == address(0)) {
            revert("InvalidChallengeManagerAddress");
        }
        challenge_manager_address = _address;
        challenge_manager = IChallengeManager(_address);
    }

    function setReputationManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_address == address(0)) {
            revert("InvalidReputationManagerAddress");
        }
        reputation_manager_address = _address;
        reputation_manager = IReputationManager(_address);
    }

    /* ============================= ROLE MANAGEMENT ============================= */
    /**
     * @dev Grant CHALLENGE_MANAGER_ROLE to an address
     * @param account The address to grant the role to
     */
    function grantChallengeManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CHALLENGE_MANAGER_ROLE, account);
    }

    /**
     * @dev Revoke CHALLENGE_MANAGER_ROLE from an address
     * @param account The address to revoke the role from
     */
    function revokeChallengeManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(CHALLENGE_MANAGER_ROLE, account);
    }

    /* ============================= VIEW FUNCTIONS ============================= */
    /**
     * @dev Get the bounty amount for a challenge
     * @param _challenge_id The challenge ID
     * @return The bounty amount
     */
    function getBounty(bytes32 _challenge_id) external view returns (uint256) {
        return pots[_challenge_id].bounty;
    }

    /**
     * @dev Get the total reward for a challenge
     * @param _challenge_id The challenge ID
     * @return The total reward amount
     */
    function getTotalReward(
        bytes32 _challenge_id
    ) external view returns (uint256) {
        return pots[_challenge_id].total_reward;
    }

    /**
     * @dev Get the reward amount for a moderator in a challenge
     * @param _challenge_id The challenge ID
     * @param moderator The moderator address
     * @return The reward amount
     */
    function getModeratorReward(
        bytes32 _challenge_id,
        address moderator
    ) external view returns (uint256) {
        return pots[_challenge_id].moderator_reward[moderator];
    }

    /**
     * @dev Check if rewards have been distributed for a challenge
     * @param _challenge_id The challenge ID
     * @return True if rewards have been distributed
     */
    function isDistributed(bytes32 _challenge_id) external view returns (bool) {
        return pots[_challenge_id].is_distributed;
    }

    /**
     * @dev Get the list of moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of moderator addresses
     */
    function getModerators(
        bytes32 _challenge_id
    ) external view returns (address[] memory) {
        return pots[_challenge_id].moderators;
    }

    /**
     * @dev Get the list of passed moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of passed moderator addresses
     */
    function getPassedModerators(
        bytes32 _challenge_id
    ) external view returns (address[] memory) {
        return pots[_challenge_id].passed_moderators;
    }

    /**
     * @dev Get the list of failed moderators for a challenge
     * @param _challenge_id The challenge ID
     * @return Array of failed moderator addresses
     */
    function getFailedModerators(
        bytes32 _challenge_id
    ) external view returns (address[] memory) {
        return pots[_challenge_id].failed_moderators;
    }

    /* ============================= INTERNAL HOOK ============================= */
    function _calculateDeviation(bytes32 _challenge_id) internal {
        if (challenge_manager_address == address(0)) {
            revert("ChallengeManagerNotSet");
        }

        Pot storage pot = pots[_challenge_id];

        // Iterate through all moderators in the pot for this challenge
        for (uint256 i = 0; i < pot.moderators.length; i++) {
            address moderator = pot.moderators[i];

            // Call ChallengeManager to get the deviation for this moderator
            uint256 deviation = challenge_manager
                .getScoreDeviationOfModeratorReview(_challenge_id, moderator); // Store the deviation in the moderator_deviation mapping
            pot.moderator_deviation[moderator] = deviation;

            // Filter moderators based on their deviation
            if (
                deviation <= SystemConsts.MODERATION_REWARD_DEVIATION_THRESHOLD
            ) {
                // If deviation is within the threshold, add to passed_moderators
                pot.passed_moderators.push(moderator);
            } else {
                // If deviation exceeds the threshold, add to failed_moderators
                pot.failed_moderators.push(moderator);
            }
        }
    }

    function _calculateReward(bytes32 _challenge_id) internal {
        Pot storage pot = pots[_challenge_id];

        if (
            reputation_manager_address == address(0) ||
            challenge_manager_address == address(0)
        ) {
            revert("Reputation Manager Not Set");
        }

        uint256 passed_count = pot.passed_moderators.length;
        if (passed_count == 0) revert("Not Enough Moderators");

        // Arrays to store moderator weights
        uint256[] memory moderator_weights = new uint256[](passed_count);
        uint256 total_weight = 0;

        // First pass: Calculate weights for eligible moderators (those who passed)
        SystemEnums.Domain domain = challenge_manager.getChallengeDomainById(
            _challenge_id
        );
        for (uint256 i = 0; i < passed_count; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 deviation = pot.moderator_deviation[moderator];
            int256 rep = reputation_manager.getDomainReputation(
                moderator,
                domain
            );
            uint256 reputation = rep < 0 ? 0 : uint256(rep);

            // Calculate weight using the formula from ModerationRewardTokenFormulas
            uint256 weight = RewardTokenFormulas.calculateWeightForModerator(
                deviation,
                reputation
            );

            moderator_weights[i] = weight;
            total_weight += weight;
        }

        // Second pass: Calculate rewards for eligible moderators
        for (uint256 i = 0; i < passed_count; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 weight = moderator_weights[i];

            // Calculate reward amount using the formula from ModerationRewardTokenFormulas
            uint256 reward = RewardTokenFormulas.calculateReward(
                weight, // weight
                total_weight, // total_weight
                pot.total_reward // total_reward
            );

            // Store the reward amount in the moderator_reward mapping
            pot.moderator_reward[moderator] = reward;
        }
    }

    function _distributeRewards(bytes32 _challenge_id) internal {
        Pot storage pot = pots[_challenge_id];

        // Mark the pot as distributed
        pot.is_distributed = true;

        // Distribute rewards to moderators who passed
        for (uint256 i = 0; i < pot.passed_moderators.length; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 reward = pot.moderator_reward[moderator];

            // Transfer reward to moderator
            (bool success, ) = moderator.call{value: reward}("");
            if (!success) {
                revert("TransferFailed");
            }
        }

        emit RewardsDistributed(_challenge_id, pot.total_reward);
    }
}
