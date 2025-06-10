// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IEvaluationEscrow
 * @dev Interface for the EvaluationEscrow contract
 * @dev Manages bounty deposits, evaluator stakes, and reward distribution for solution evaluations
 */
interface IEvaluationEscrow {
    // ============================== EVENTS ==============================
    
    /**
     * @dev Emitted when a bounty is deposited for a solution
     * @param solution_id The ID of the solution
     * @param solver The address of the solver who deposited the bounty
     * @param amount The amount of bounty deposited
     */
    event BountyDeposited(
        uint256 indexed solution_id,
        address solver,
        uint256 amount
    );

    /**
     * @dev Emitted when an evaluator stakes tokens for a solution
     * @param solution_id The ID of the solution
     * @param evaluator The address of the evaluator who staked
     * @param amount The amount staked
     */
    event Staked(
        uint256 indexed solution_id,
        address evaluator,
        uint256 amount
    );

    /**
     * @dev Emitted when rewards are distributed for a solution
     * @param solution_id The ID of the solution
     * @param total_reward The total reward amount distributed
     */
    event RewardsDistributed(uint256 indexed solution_id, uint256 total_reward);

    // ============================== SOLVER FLOW ==============================

    /**
     * @dev Solver deposits bounty for a solution (native token only)
     * @param _solution_id The ID of the solution
     * @notice This function must be called once the solution is submitted, called by SolutionManager
     */
    function depositBounty(
        uint256 _solution_id,
        address _solver
    ) external payable;

    // ============================== EVALUATOR FLOW ==============================

    /**
     * @dev Evaluator stakes native token when opting in to evaluation pool
     * @param _solution_id The ID of the solution
     * @notice This function should be called when an evaluator submits their evaluation for a solution
     */
    function stake(
        uint256 _solution_id,
        address _evaluator
    ) external payable;

    // ============================== FINALIZATION & PAY-OUT ==============================

    /**
     * @dev Finalizes the solution pot and distributes rewards
     * @param _solution_id The ID of the solution
     * @notice Can only be called by SolutionManager after the solution evaluation is finalized
     */
    function finalizeSolutionPot(uint256 _solution_id) external;

    // ============================== VIEW FUNCTIONS ==============================

    /**
     * @dev Get the solution pot information
     * @param _solution_id The solution ID
     * @return bounty The bounty amount
     * @return total_reward The total reward amount
     * @return evaluators Array of evaluator addresses
     */
    function getSolutionPot(
        uint256 _solution_id
    )
        external
        view
        returns (
            uint256 bounty,
            uint256 total_reward,
            address[] memory evaluators
        );

    /**
     * @dev Get the list of passed evaluators for a solution
     * @param _solution_id The solution ID
     * @return Array of passed evaluator addresses
     */
    function getPassedEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory);

    /**
     * @dev Get the list of failed evaluators for a solution
     * @param _solution_id The solution ID
     * @return Array of failed evaluator addresses
     */
    function getFailedEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory);

    /**
     * @dev Get the stake amount for an evaluator in a solution
     * @param _solution_id The solution ID
     * @param _evaluator The evaluator address
     * @return The stake amount
     */
    function getEvaluatorStake(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256);

    /**
     * @dev Get the reward amount for an evaluator in a solution
     * @param _solution_id The solution ID
     * @param _evaluator The evaluator address
     * @return The reward amount
     */
    function getEvaluatorReward(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256);

    /**
     * @dev Get the penalty amount for an evaluator in a solution
     * @param _solution_id The solution ID
     * @param _evaluator The evaluator address
     * @return The penalty amount
     */
    function getEvaluatorPenalty(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256);

    /**
     * @dev Get the deviation for an evaluator in a solution
     * @param _solution_id The solution ID
     * @param _evaluator The evaluator address
     * @return The deviation amount
     */
    function getEvaluatorDeviation(
        uint256 _solution_id,
        address _evaluator
    ) external view returns (uint256);

    /**
     * @dev Get the bounty amount for a solution
     * @param _solution_id The solution ID
     * @return The bounty amount
     */
    function getBounty(uint256 _solution_id) external view returns (uint256);

    /**
     * @dev Get the solver address for a solution
     * @param _solution_id The solution ID
     * @return The solver address
     */
    function getSolver(uint256 _solution_id) external view returns (address);

    /**
     * @dev Get the total reward for a solution
     * @param _solution_id The solution ID
     * @return The total reward amount
     */
    function getTotalReward(
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get the list of all evaluators for a solution
     * @param _solution_id The solution ID
     * @return Array of evaluator addresses
     */
    function getEvaluators(
        uint256 _solution_id
    ) external view returns (address[] memory);

    /**
     * @dev Check if rewards have been distributed for a solution
     * @param _solution_id The solution ID
     * @return True if rewards have been distributed
     */
    function isDistributed(uint256 _solution_id) external view returns (bool);

    // ============================== SETTER METHODS ==============================

    /**
     * @dev Set the SolutionManager address
     * @param _address The address of the SolutionManager contract
     * @notice Only admin can set the SolutionManager address
     */
    function setSolutionManagerAddress(address _address) external;

    // ============================== ROLE MANAGEMENT ==============================

    /**
     * @dev Grant the SOLUTION_MANAGER_ROLE to an account
     * @param account The account to grant the role to
     */
    function grantSolutionManagerRole(address account) external;

    /**
     * @dev Revoke the SOLUTION_MANAGER_ROLE from an account
     * @param account The account to revoke the role from
     */
    function revokeSolutionManagerRole(address account) external;
}
