// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ChallengeManager.sol";
import "./Formulas.sol";
import "./Constants.sol";

contract ModerationEscrow {
    /* ============================= Errors ============================= */
    error ZeroValue();
    error AlreadyDistributed();
    error NotEnoughModerators();
    error TransferFailed();
    error ChallengeManagerNotSet();
    error InvalidChallengeManagerAddress();
    error ContributorAlreadyFunded();
    error ModeratorAlreadyFunded();

    /* ============================= Events ============================= */
    event BountyDeposited(
        uint256 indexed challenge_id,
        address contributor,
        uint256 amount
    );
    event Staked(
        uint256 indexed challenge_id,
        address moderator,
        uint256 amount
    );
    event RewardsDistributed(
        uint256 indexed challenge_id,
        uint256 total_reward
    );

    /* ============================= STRUCTS ============================= */
    struct Pot {
        uint256 bounty; // Total bounty put up by contributor(s)
        uint256 total_reward; // Total reward = bounty + total penalty amount of each moderator who failed
        mapping(address => uint256) moderator_stake; // Mapping: moderator address => stake amount
        mapping(address => uint256) moderator_reward; // Mapping: moderator address => reward amount
        mapping(address => uint256) moderator_penalty; // Mapping: moderator address => penalty amount
        mapping(address => uint256) moderator_deviation; // Mapping: moderator address => deviation between their quality score the gave and the finalized score of challenge.
        address[] moderators; // List of moderators who join review pool of this this challenge
        address[] passed_moderators; // List of moderators who passed the challenge (deviation <= DEVIATION_THRESHOLD)
        address[] failed_moderators; // List of moderators who failed the challenge (deviation > DEVIATION_THRESHOLD)
        bool is_distributed; // Flag to check if rewards have been distributed
    }

    /* ============================= STATE VARIABLES ============================= */
    mapping(uint256 challenge_id => Pot) private pots;

    ChallengeManager private challenge_manager; // ChallengeManager instance
    address private challenge_manager_address; // ChallengeManager address

    /* ============================= CONTRIBUTOR FLOW ============================= */
    /// @dev Contributor deposits bounty for a challenge (native token only).
    //TODO: This function must be called once the challenge is created (contributed), called by ChallengeManager
    function depositBounty(uint256 _challenge_id) external payable {
        if (msg.value == 0) {
            revert ZeroValue();
        }

        Pot storage pot = pots[_challenge_id];

        if (pot.bounty > 0) {
            revert ContributorAlreadyFunded();
        }

        pot.bounty = msg.value;
        pot.total_reward = msg.value; // Initialize total reward with the bounty amount

        emit BountyDeposited(_challenge_id, msg.sender, msg.value);
    }

    /* ============================= MODERATOR FLOW ============================= */
    /// @dev Moderator stakes native token when opting in to review pool.
    // TODO: This function should be called when a moderator submit their review for a challenge, only be called by ChallengeManager
    function stake(uint256 _challenge_id) external payable {
        if (msg.value == 0) revert ZeroValue();

        Pot storage pot = pots[_challenge_id];

        if (pot.moderator_stake[msg.sender] > 0) {
            revert ModeratorAlreadyFunded();
        }

        pot.moderators.push(msg.sender);
        pot.moderator_stake[msg.sender] = msg.value;

        emit Staked(_challenge_id, msg.sender, msg.value);
    }

    /* ============================= FINALIZATION & PAY-OUT ============================= */
    // TODO: Add access control to this function, can only be called by ChallengeManager after the challenge is finalized
    function finalizeChallengePot(uint256 _challenge_id) external {
        Pot storage pot = pots[_challenge_id];

        if (pot.is_distributed == true) {
            revert AlreadyDistributed();
        }

        _calculateDeviation(_challenge_id);
        _calculatePenalty(_challenge_id);
        _calculateReward(_challenge_id);
        _distributeRewards(_challenge_id);
    }

    /* ============================= VIEWS ============================= */

    // ================= SETTER METHODS =================
    // TODO: Add access control to this function, only admin can set the ChallengeManager address
    function setChallengeManagerAddress(address _address) external {
        if (_address == address(0)) {
            revert InvalidChallengeManagerAddress();
        }
        challenge_manager_address = _address;
        challenge_manager = ChallengeManager(_address);
    }

    /* ============================= INTERNAL HOOK ============================= */
    function _calculateDeviation(uint256 _challenge_id) internal {
        if (challenge_manager_address == address(0)) {
            revert ChallengeManagerNotSet();
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
            if (deviation <= SystemConsts.REWARD_DEVIATION_THRESHOLD) {
                // If deviation is within the threshold, add to passed_moderators
                pot.passed_moderators.push(moderator);
            } else {
                // If deviation exceeds the threshold, add to failed_moderators
                pot.failed_moderators.push(moderator);
            }
        }
    }

    function _calculatePenalty(uint256 _challenge_id) internal {
        Pot storage pot = pots[_challenge_id];

        // Calculate penalties for moderators who failed (already filtered in _calculateDeviation)
        for (uint256 i = 0; i < pot.failed_moderators.length; i++) {
            address moderator = pot.failed_moderators[i];
            uint256 deviation = pot.moderator_deviation[moderator];
            uint256 moderator_stake = pot.moderator_stake[moderator];

            // Calculate penalty using the formula from ModerationPenaltyTokenFormulas
            uint256 penalty = ModerationPenaltyTokenFormulas.calculatePenalty(
                deviation, // di_raw: moderator's deviation
                moderator_stake // si_raw: moderator's stake
            );

            // Guard the moderator stake in case the penalty exceeds the moderator's stake
            // Theotically, this should not happen, but we need to ensure it will never happen
            if (penalty > moderator_stake) {
                penalty = 0;
            }

            // Store the penalty in the mapping
            pot.moderator_penalty[moderator] = penalty;

            // Add penalty amount into the total_reward
            pot.total_reward += penalty;
        }
    }

    function _calculateReward(uint256 _challenge_id) internal {
        Pot storage pot = pots[_challenge_id];

        uint256 passed_count = pot.passed_moderators.length;
        if (passed_count == 0) revert NotEnoughModerators();

        // Arrays to store moderator weights
        uint256[] memory moderator_weights = new uint256[](passed_count);
        uint256 total_weight = 0;

        // First pass: Calculate weights for eligible moderators (those who passed)
        for (uint256 i = 0; i < passed_count; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 deviation = pot.moderator_deviation[moderator];
            uint256 moderator_stake = pot.moderator_stake[moderator];

            // Calculate weight using the formula from ModerationRewardTokenFormulas
            uint256 weight = ModerationRewardTokenFormulas.calculateWeight(
                deviation, // di_raw: moderator's deviation
                moderator_stake // si_raw: moderator's stake
            );

            moderator_weights[i] = weight;
            total_weight += weight;
        }

        // Second pass: Calculate rewards for eligible moderators
        for (uint256 i = 0; i < passed_count; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 weight = moderator_weights[i];

            // Calculate reward amount using the formula from ModerationRewardTokenFormulas
            uint256 reward = ModerationRewardTokenFormulas
                .calculateRewardForEachModerator(
                    weight, // weight
                    total_weight, // total_weight
                    pot.total_reward // total_reward
                );

            // Store the reward amount in the moderator_reward mapping
            pot.moderator_reward[moderator] = reward;
        }
    }

    function _distributeRewards(uint256 _challenge_id) internal {
        Pot storage pot = pots[_challenge_id];

        // Mark the pot as distributed
        pot.is_distributed = true;

        // Distribute rewards to moderators who passed
        for (uint256 i = 0; i < pot.passed_moderators.length; i++) {
            address moderator = pot.passed_moderators[i];
            uint256 moderator_stake = pot.moderator_stake[moderator];
            uint256 reward = pot.moderator_reward[moderator];
            uint256 total_payout = moderator_stake + reward;

            // Transfer stake + reward to moderator
            (bool success, ) = moderator.call{value: total_payout}("");
            if (!success) {
                revert TransferFailed();
            }
        }

        // Distribute remaining stake (after penalty) to moderators who failed
        for (uint256 i = 0; i < pot.failed_moderators.length; i++) {
            address moderator = pot.failed_moderators[i];
            uint256 moderator_stake = pot.moderator_stake[moderator];
            uint256 penalty = pot.moderator_penalty[moderator];

            // Calculate remaining amount after penalty (penalty cannot exceed stake)
            uint256 remaining_stake = moderator_stake > penalty
                ? moderator_stake - penalty
                : 0;

            // Transfer remaining stake to moderator (if any)
            if (remaining_stake > 0) {
                (bool success, ) = moderator.call{value: remaining_stake}("");
                if (!success) {
                    revert TransferFailed();
                }
            }
        }

        emit RewardsDistributed(_challenge_id, pot.total_reward);
    }
}
