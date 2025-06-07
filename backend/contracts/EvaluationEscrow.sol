// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ISolutionManager.sol";
import "./Formulas.sol";
import "./Constants.sol";

contract EvaluationEscrow is AccessControl {
    /* ============================= ROLE CONSTANTS ============================= */
    bytes32 public constant SOLUTION_MANAGER_ROLE =
        keccak256("SOLUTION_MANAGER_ROLE");

    /* ============================= CONSTRUCTOR ============================= */
    constructor() {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    /* ============================= Events ============================= */
    event BountyDeposited(
        uint256 indexed solution_id,
        address solver,
        uint256 amount
    );
    event Staked(
        uint256 indexed solution_id,
        address evaluator,
        uint256 amount
    );
    event RewardsDistributed(uint256 indexed solution_id, uint256 total_reward);

    /* ============================= STRUCTS ============================= */
    struct Pot {
        uint256 bounty; // Total bounty put up by solver(s)
        address solver; // Address of the solver who funded the bounty
        uint256 total_reward; // Total reward = bounty + total penalty amount of each evaluator who failed
        mapping(address => uint256) evaluator_stake; // Mapping: evaluator address => stake amount
        mapping(address => uint256) evaluator_reward; // Mapping: evaluator address => reward amount
        mapping(address => uint256) evaluator_penalty; // Mapping: evaluator address => penalty amount
        mapping(address => uint256) evaluator_deviation; // Mapping: evaluator address => deviation between their solution score and the finalized score.
        address[] evaluators; // List of evaluators who join evaluation pool of this solution
        address[] passed_evaluators; // List of evaluators who will be rewarded
        address[] failed_evaluators; // List of evaluators who will be penalized
        bool is_distributed; // Flag to check if rewards have been distributed
    }

    /* ============================= STATE VARIABLES ============================= */
    mapping(uint256 solution_id => Pot) private pots;

    ISolutionManager private solution_manager; // ISolutionManager instance
    address private solution_manager_address; // SolutionManager address

    /* ============================= SOLVER FLOW ============================= */
    /// @dev Solver deposits bounty for a solution (native token only).
    //TODO: This function must be called once the solution is submitted, called by SolutionManager
    function depositBounty(
        uint256 _solution_id,
        address _solver
    ) external payable onlyRole(SOLUTION_MANAGER_ROLE) {
        if (msg.value == 0) {
            revert("Zero value");
        }

        // Check that this solution_id hasn't already been funded
        if (pots[_solution_id].bounty > 0) {
            revert("Solver already funded");
        }

        pots[_solution_id].bounty = msg.value;
        pots[_solution_id].total_reward = msg.value;
        pots[_solution_id].solver = _solver;

        emit BountyDeposited(_solution_id, _solver, msg.value);
    }

    /* ============================= EVALUATOR FLOW ============================= */
    /// @dev Evaluator stakes native token when opting in to evaluation pool.
    // TODO: This function should be called when an evaluator submits their evaluation for a solution, only be called by SolutionManager
    function stake(
        uint256 _solution_id,
        address _evaluator
    ) external payable onlyRole(SOLUTION_MANAGER_ROLE) {
        if (msg.value == 0) {
            revert("Zero value");
        }

        // Check that this evaluator hasn't already staked for this solution
        if (pots[_solution_id].evaluator_stake[_evaluator] > 0) {
            revert("Evaluator already funded");
        }

        pots[_solution_id].evaluator_stake[_evaluator] = msg.value;
        pots[_solution_id].evaluators.push(_evaluator);

        emit Staked(_solution_id, _evaluator, msg.value);
    }

    /* ============================= FINALIZATION & PAY-OUT ============================= */
    // TODO: Add access control to this function, can only be called by SolutionManager after the solution evaluation is finalized
    function finalizeSolutionPot(uint256 _solution_id) external onlyRole(SOLUTION_MANAGER_ROLE) {
        if (solution_manager_address == address(0)) {
            revert("Solution manager not set");
        }

        // Check if rewards have already been distributed
        if (pots[_solution_id].is_distributed) {
            revert("Already distributed");
        }

        // Ensure we have enough evaluators to proceed
        if (pots[_solution_id].evaluators.length == 0) {
            revert("Not enough evaluators");
        }

        _calculateDeviation(_solution_id);
        _calculatePenalty(_solution_id);
        _calculateReward(_solution_id);
        _distributeRewards(_solution_id);
    }

    /* ============================= VIEWS ============================= */
    function getSolutionPot(
        uint256 _solution_id
    )
        external
        view
        returns (
            uint256 bounty,
            uint256 total_reward,
            address[] memory evaluators
        )
    {
        Pot storage pot = pots[_solution_id];
        return (pot.bounty, pot.total_reward, pot.evaluators);
    }

    function getPassedEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory) {
        return pots[_solution_id].passed_evaluators;
    }

    function getFailedEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory) {
        return pots[_solution_id].failed_evaluators;
    }

    function getEvaluatorStake(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256) {
        return pots[_solution_id].evaluator_stake[_evaluator];
    }

    function getEvaluatorReward(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256) {
        return pots[_solution_id].evaluator_reward[_evaluator];
    }

    function getEvaluatorPenalty(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256) {
        return pots[_solution_id].evaluator_penalty[_evaluator];
    }

    function getEvaluatorDeviation(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256) {
        return pots[_solution_id].evaluator_deviation[_evaluator];
    }

    /**
     * @notice Get the bounty amount for a solution
     * @param _solution_id The solution ID
     * @return The bounty amount
     */
    function getBounty(uint256 _solution_id) external view returns (uint256) {
        return pots[_solution_id].bounty;
    }

    /**
     * @notice Get the solver address for a solution
     * @param _solution_id The solution ID
     * @return The solver address
     */
    function getSolver(uint256 _solution_id) external view returns (address) {
        return pots[_solution_id].solver;
    }

    /**
     * @notice Get the total reward for a solution
     * @param _solution_id The solution ID
     * @return The total reward amount
     */
    function getTotalReward(
        uint256 _solution_id
    ) external view returns (uint256) {
        return pots[_solution_id].total_reward;
    }

    /**
     * @notice Get the list of all evaluators for a solution
     * @param _solution_id The solution ID
     * @return Array of evaluator addresses
     */
    function getEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory) {
        return pots[_solution_id].evaluators;
    }

    /**
     * @notice Check if rewards have been distributed for a solution
     * @param _solution_id The solution ID
     * @return True if rewards have been distributed
     */
    function isDistributed(uint256 _solution_id) external view returns (bool) {
        return pots[_solution_id].is_distributed;
    }// ================= SETTER METHODS =================
    // TODO: Add access control to this function, only admin can set the SolutionManager address
    function setSolutionManagerAddress(address _address) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_address == address(0)) {
            revert("Invalid solution manager address");
        }
        solution_manager_address = _address;
        solution_manager = ISolutionManager(_address);
    }

    /* ============================= ROLE MANAGEMENT ============================= */
    /**
     * @notice Grant the SOLUTION_MANAGER_ROLE to an account
     * @param account The account to grant the role to
     */
    function grantSolutionManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SOLUTION_MANAGER_ROLE, account);
    }

    /**
     * @notice Revoke the SOLUTION_MANAGER_ROLE from an account
     * @param account The account to revoke the role from
     */
    function revokeSolutionManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SOLUTION_MANAGER_ROLE, account);
    }

    /* ============================= INTERNAL HOOK ============================= */
    function _calculateDeviation(uint256 _solution_id) internal {
        Pot storage pot = pots[_solution_id];

        for (uint256 i = 0; i < pot.evaluators.length; i++) {
            address evaluator = pot.evaluators[i];

            // Get the deviation directly from SolutionManager
            uint256 deviation = solution_manager.getEvaluationDeviation(
                evaluator,
                _solution_id
            );

            pot.evaluator_deviation[evaluator] = deviation;

            // Filter evaluators based on their deviation
            if (
                deviation <= SystemConsts.EVALUATION_REWARD_DEVIATION_THRESHOLD
            ) {
                // If deviation is within the threshold, add to passed_evaluators
                pot.passed_evaluators.push(evaluator);
            } else {
                // If deviation exceeds the threshold, add to failed_evaluators
                pot.failed_evaluators.push(evaluator);
            }
        }
    }    
    
    function _calculatePenalty(uint256 _solution_id) internal {
        Pot storage pot = pots[_solution_id];

        // Calculate penalties for evaluators who failed (already filtered in _calculateDeviation)
        for (uint256 i = 0; i < pot.failed_evaluators.length; i++) {
            address evaluator = pot.failed_evaluators[i];
            uint256 deviation = pot.evaluator_deviation[evaluator];
            uint256 evaluator_stake = pot.evaluator_stake[evaluator];

            // Calculate penalty using the formula from EvaluationPenaltyTokenFormulas
            uint256 penalty = PenaltyTokenFormulas.calculatePenaltyForEvaluator(
                deviation, // di_raw: evaluator's deviation
                evaluator_stake // si_raw: evaluator's stake
            );

            // Guard the evaluator stake in case the penalty exceeds the evaluator's stake
            // Theoretically, this should not happen, but we need to ensure it will never happen
            if (penalty > evaluator_stake) {
                penalty = 0;
            }

            // Store the penalty in the mapping
            pot.evaluator_penalty[evaluator] = penalty;

            // Add penalty amount into the total_reward
            pot.total_reward += penalty;
        }
    }    
    
    function _calculateReward(uint256 _solution_id) internal {
        Pot storage pot = pots[_solution_id];

        uint256 passed_count = pot.passed_evaluators.length;
        if (passed_count == 0) revert("Not enough evaluators");

        // Arrays to store evaluator weights
        uint256[] memory evaluator_weights = new uint256[](passed_count);
        uint256 total_weight = 0;

        // First pass: Calculate weights for eligible evaluators (those who passed)
        for (uint256 i = 0; i < passed_count; i++) {
            address evaluator = pot.passed_evaluators[i];
            uint256 deviation = pot.evaluator_deviation[evaluator];
            uint256 evaluator_stake = pot.evaluator_stake[evaluator];

            // Calculate weight using the formula from EvaluationRewardTokenFormulas
            uint256 weight = RewardTokenFormulas.calculateWeightForEvaluator(
                deviation, // di_raw: evaluator's deviation
                evaluator_stake // si_raw: evaluator's stake
            );

            evaluator_weights[i] = weight;
            total_weight += weight;
        }

        // Second pass: Calculate rewards for eligible evaluators
        for (uint256 i = 0; i < passed_count; i++) {
            address evaluator = pot.passed_evaluators[i];
            uint256 weight = evaluator_weights[i];

            // Calculate reward amount using the formula from EvaluationRewardTokenFormulas
            uint256 reward = RewardTokenFormulas.calculateReward(
                weight, // weight
                total_weight, // total_weight
                pot.total_reward // total_reward
            );

            // Store the reward amount in the evaluator_reward mapping
            pot.evaluator_reward[evaluator] = reward;
        }
    }    
    
    function _distributeRewards(uint256 _solution_id) internal {
        Pot storage pot = pots[_solution_id];

        // Mark the pot as distributed
        pot.is_distributed = true;

        // Distribute rewards to evaluators who passed
        for (uint256 i = 0; i < pot.passed_evaluators.length; i++) {
            address evaluator = pot.passed_evaluators[i];
            uint256 evaluator_stake = pot.evaluator_stake[evaluator];
            uint256 reward = pot.evaluator_reward[evaluator];
            uint256 total_payout = evaluator_stake + reward;

            // Transfer stake + reward to evaluator
            (bool success, ) = evaluator.call{value: total_payout}("");
            if (!success) {
                revert("Transfer failed");
            }
        }

        // Distribute remaining stake (after penalty) to evaluators who failed
        for (uint256 i = 0; i < pot.failed_evaluators.length; i++) {
            address evaluator = pot.failed_evaluators[i];
            uint256 evaluator_stake = pot.evaluator_stake[evaluator];
            uint256 penalty = pot.evaluator_penalty[evaluator];

            // Calculate remaining amount after penalty (penalty cannot exceed stake)
            uint256 remaining_stake = evaluator_stake - penalty;

            // Transfer remaining stake to evaluator (if any)
            if (remaining_stake > 0) {
                (bool success, ) = evaluator.call{value: remaining_stake}("");
                if (!success) {
                    revert("Transfer failed");
                }
            }
        }

        emit RewardsDistributed(_solution_id, pot.total_reward);
    }
}
