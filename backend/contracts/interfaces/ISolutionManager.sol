// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Constants.sol";

/**
 * @title ISolutionManager
 * @dev Interface for the SolutionManager contract
 * @dev Manages solution submission, evaluation, and scoring for challenges
 */
interface ISolutionManager {
    // ============================== STRUCTS ==============================
    struct Solution {
        uint256 id;
        address user;
        uint256 challenge_id;
        string solution_txid;
        uint256 created_at;
        uint256 submitted_at;
        SystemEnums.SolutionProgress progress;
        uint256 score;
    }

    struct Evaluation {
        address evaluator;
        uint256 evaluation_score;
        uint256 submitted_at;
    }

    struct UnderReviewSolutionPreview {
        uint256 id;
        address submitter;
        string challenge_title_url;
        SystemEnums.Domain domain;
        string solution_txid;
        uint256 submitted_at;
        SystemEnums.SolutionProgress progress;
        uint256 number_of_joined_evaluators;
        uint256 total_evaluators;
    }

    // ============================== EVENTS ==============================
    event SolutionBaseCreated(
        address indexed user_address,
        uint256 indexed challenge_id,
        string solution_base_txid,
        uint256 created_at
    );

    event SolutionSubmitted(uint256 indexed solution_id, uint256 submitted_at);

    event SolutionPoolInitialized(
        uint256 indexed solution_id,
        uint256 initialized_at
    );

    event SolutionJoinedByEvaluator(
        address indexed evaluator,
        uint256 indexed solution_id,
        uint256 joined_at
    );

    event SolutionScoreSubmittedByEvaluator(
        address indexed evaluator,
        uint256 indexed solution_id,
        uint256 score,
        uint256 submitted_at
    );

    event SolutionEvaluationFinalized(
        uint256 indexed solution_id,
        uint256 score,
        uint256 finalized_at
    );

    // ============================== SOLUTION INTERACTION METHODS ==============================
    /**
     * @dev Create a base solution for a challenge
     * @param _user_address Address of the user creating the solution
     * @param _challenge_id ID of the challenge
     * @param _solution_base_txid Transaction ID of the solution base
     * @param _created_at Timestamp when the solution was created
     */
    function createSolutionBase(
        address _user_address,
        uint256 _challenge_id,
        string calldata _solution_base_txid,
        uint256 _created_at
    ) external;

    /**
     * @dev Submit a solution for a challenge
     * @param _challenge_id ID of the challenge
     */
    function submitSolution(uint256 _challenge_id) external;

    /**
     * @dev Put a solution under review for evaluation
     * @param _challenge_id ID of the challenge
     */
    function putSolutionUnderReview(uint256 _challenge_id) external;

    /**
     * @dev Join as an evaluator for a solution
     * @param _solution_id ID of the solution to evaluate
     */
    function evaluatorJoinSolution(uint256 _solution_id) external;

    /**
     * @dev Submit evaluation score for a solution
     * @param _solution_id ID of the solution being evaluated
     * @param _score Score given by the evaluator
     */
    function evaluatorSubmitScore(
        uint256 _solution_id,
        uint256 _score
    ) external;

    // ============================== SETTER METHODS ==============================
    /**
     * @dev Set the ChallengeManager contract address
     * @param _address Address of the ChallengeManager contract
     */
    function setChallengeManagerAddress(address _address) external;

    /**
     * @dev Set the ReputationManager contract address
     * @param _address Address of the ReputationManager contract
     */
    function setReputationManagerAddress(address _address) external;

    // ============================== GETTER METHODS ==============================
    /**
     * @dev Get solution transaction ID for a user and challenge
     * @param _user_address Address of the user
     * @param _challenge_id ID of the challenge
     * @return The solution transaction ID
     */
    function getSolutionTxId(
        address _user_address,
        uint256 _challenge_id
    ) external view returns (string memory);

    /**
     * @dev Get solution preview information for a user and challenge
     * @param _user_address Address of the user
     * @param _challenge_id ID of the challenge
     * @return created_at Timestamp when solution was created
     * @return progress Current progress of the solution
     * @return score Score of the solution
     */
    function getSolutionPreviewByUserAndChallengeId(
        address _user_address,
        uint256 _challenge_id
    )
        external
        view
        returns (
            uint256 created_at,
            SystemEnums.SolutionProgress progress,
            uint256 score
        );

    /**
     * @dev Get complete solution information for a user and challenge
     * @param _user_address Address of the user
     * @param _challenge_id ID of the challenge
     * @return The complete solution struct
     */
    function getSolutionByUserAndChallengeId(
        address _user_address,
        uint256 _challenge_id
    ) external view returns (Solution memory);

    /**
     * @dev Get solution by its ID
     * @param _solution_id ID of the solution
     * @return The solution struct
     */
    function getSolutionById(
        uint256 _solution_id
    ) external view returns (Solution memory);

    /**
     * @dev Get solutions assigned to an evaluator
     * @param _evaluator_address Address of the evaluator
     * @return Array of solution previews under review
     */
    function getSolutionByEvaluator(
        address _evaluator_address
    ) external view returns (UnderReviewSolutionPreview[] memory);

    /**
     * @dev Get all solutions currently under review
     * @return Array of solution previews under review
     */
    function getUnderReviewSolutionPreview()
        external
        view
        returns (UnderReviewSolutionPreview[] memory);

    /**
     * @dev Get maximum number of evaluators for a solution
     * @param _solution_id ID of the solution
     * @return Maximum number of evaluators
     */
    function getMaxEvaluatorsForSolution(
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get number of evaluators who joined for a solution
     * @param _solution_id ID of the solution
     * @return Number of joined evaluators
     */
    function getNumberOfJoinedEvaluators(
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get number of submitted evaluations for a solution
     * @param _solution_id ID of the solution
     * @return Number of submitted evaluations
     */
    function getNumberOfSubmittedEvaluations(
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get timestamp when evaluation was completed
     * @param _solution_id ID of the solution
     * @return Timestamp of evaluation completion
     */
    function getTimestampEvaluationCompleted(
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get score submitted by a specific evaluator
     * @param _evaluator_address Address of the evaluator
     * @param _solution_id ID of the solution
     * @return Score submitted by the evaluator
     */
    function getScoreSubmittedByEvaluator(
        address _evaluator_address,
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Get timestamp when evaluator submitted their score
     * @param _evaluator_address Address of the evaluator
     * @param _solution_id ID of the solution
     * @return Timestamp when score was submitted
     */
    function getTimestampScoreSubmittedByEvaluator(
        address _evaluator_address,
        uint256 _solution_id
    ) external view returns (uint256);

    /**
     * @dev Check if user has joined a challenge
     * @param _user_address Address of the user
     * @param _challenge_id ID of the challenge
     * @return True if user has joined the challenge
     */
    function checkUserJoinedChallenge(
        address _user_address,
        uint256 _challenge_id
    ) external view returns (bool);

    /**
     * @dev Check if evaluator has joined evaluation for a solution
     * @param _evaluator_address Address of the evaluator
     * @param _solution_id ID of the solution
     * @return True if evaluator has joined
     */
    function checkEvaluatorJoinedSolution(
        address _evaluator_address,
        uint256 _solution_id
    ) external view returns (bool);

    /**
     * @dev Check if evaluator has submitted score for a solution
     * @param _evaluator_address Address of the evaluator
     * @param _solution_id ID of the solution
     * @return True if evaluator has submitted score
     */
    function checkEvalutorSubmittedScore(
        address _evaluator_address,
        uint256 _solution_id
    ) external view returns (bool);

    /**
     * @dev Get the deviation between evaluator's score and final solution score
     * @param _evaluator_address Address of the evaluator
     * @param _solution_id ID of the solution
     * @return The absolute deviation between evaluator's score and final score
     */
    function getEvaluationDeviation(
        address _evaluator_address,
        uint256 _solution_id
    ) external view returns (uint256);
}
