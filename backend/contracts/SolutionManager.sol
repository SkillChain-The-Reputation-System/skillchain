// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Constants.sol";
import "./interfaces/IReputationManager.sol";
import "./interfaces/IChallengeManager.sol";
import "./interfaces/IRoleManager.sol";
import "./interfaces/IEvaluationEscrow.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SolutionManager is AccessControl {
    // ================= STRUCTS =================
    struct Solution {
        bytes32 id;
        address user;
        bytes32 challenge_id;
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

    struct EvaluationPool {
        uint256 total_evaluators;
        uint256 evaluation_count;
        address[] evaluator_list;
        mapping(address => bool) evaluator_joined;
        mapping(address => bool) evaluator_submitted;
        mapping(address => Evaluation) evaluator_to_evaluation;
        uint256 completed_at;
    }

    // ================= STATE VARIABLES =================
    // Mapping: Solution ID -> Solution
    mapping(bytes32 => Solution) private solutions;
    // Mapping: User address + Challenge ID -> Solution ID)
    mapping(address => mapping(bytes32 => bytes32))
        public user_challenge_to_solution;
    // Mapping: Challenge ID + User address -> Is user joined challenge
    mapping(address => mapping(bytes32 => bool))
        private is_user_joined_challenge;
    // Mapping: Evaluator address -> Solution IDs for evaluation pool
    mapping(address => bytes32[]) private evaluator_to_solution;
    // Mapping: Solution ID -> Evaluation Pool
    mapping(bytes32 => EvaluationPool) private solution_to_evaluation_pool;
    // Mapping: Solution ID -> Is under review
    mapping(bytes32 => bool) private is_under_review_solution;
    // Array of under review solutions
    bytes32[] private solutions_under_review;

    IChallengeManager private challenge_manager; // ChallengeManager instance
    address private challenge_manager_address; // ChallengeManager address
    IReputationManager private reputation_manager; // ReputationManager instance
    address private reputation_manager_address; // ReputationManager address
    IRoleManager private role_manager; // RoleManager instance
    address private role_manager_address; // RoleManager address

    uint256 private total_solutions = 0;

    // ================= EVENTS =================
    event SolutionBaseCreated(
        address indexed user_address,
        bytes32 indexed challenge_id,
        string solution_base_txid,
        uint256 created_at
    );

    event SolutionSubmitted(bytes32 indexed solution_id, uint256 submitted_at);

    event SolutionPoolInitialized(
        bytes32 indexed solution_id,
        uint256 initialized_at
    );

    event SolutionJoinedByEvaluator(
        address indexed evaluator,
        bytes32 indexed solution_id,
        uint256 joined_at
    );

    event SolutionScoreSubmittedByEvaluator(
        address indexed evaluator,
        bytes32 indexed solution_id,
        uint256 score,
        uint256 submitted_at
    );

    event SolutionEvaluationFinalized(
        bytes32 indexed solution_id,
        uint256 score,
        uint256 finalized_at
    );

    // ================= CONSTRUCTOR =================
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ================= MODIFIER =================
    modifier onlyUserJoinedChallenge(
        address _user_address,
        bytes32 _challenge_id
    ) {
        require(
            is_user_joined_challenge[_user_address][_challenge_id],
            "User not joined challenge"
        );
        _;
    }

    modifier onlySolutionUnderReview(bytes32 _solution_id) {
        require(
            is_under_review_solution[_solution_id],
            "Solution not under review"
        );
        _;
    }

    // ================= ROLE-BASED ACCESS CONTROL MODIFIERS =================
    modifier onlyEvaluator(bytes32 solutionId) {
        require(address(role_manager) != address(0), "Role manager not set");
        SystemEnums.Domain domain = challenge_manager.getChallengeDomainById(
            solutions[solutionId].challenge_id
        );
        require(
            role_manager.isEvaluator(msg.sender, domain),
            "You are not an evaluator for this domain"
        );
        _;
    }

    // ================= SOLUTION INTERFACTION METHODS =================
    function createSolutionBase(
        address _user_address,
        bytes32 _challenge_id,
        string calldata _solution_base_txid,
        uint256 _created_at
    ) external returns (bytes32 id) {
        id = keccak256(
            abi.encodePacked(_user_address, _challenge_id, _created_at)
        );

        Solution storage sl = solutions[id];

        sl.id = id;
        sl.user = _user_address;
        sl.challenge_id = _challenge_id;
        sl.solution_txid = _solution_base_txid;
        sl.created_at = _created_at;
        sl.progress = SystemEnums.SolutionProgress.IN_PROGRESS;

        // Mark solution ID and joined challenge
        user_challenge_to_solution[_user_address][_challenge_id] = id;

        // Mark joining state
        is_user_joined_challenge[_user_address][_challenge_id] = true;

        emit SolutionBaseCreated(
            _user_address,
            _challenge_id,
            _solution_base_txid,
            _created_at
        );
    }

    function submitSolution(
        bytes32 _challenge_id
    ) external onlyUserJoinedChallenge(msg.sender, _challenge_id) {
        bytes32 id = user_challenge_to_solution[msg.sender][_challenge_id];
        Solution storage sl = solutions[id];

        require(
            sl.progress == SystemEnums.SolutionProgress.IN_PROGRESS,
            "Solution not in progress"
        );

        uint256 submittedAt = block.timestamp;

        // Update solution state
        sl.submitted_at = submittedAt;
        sl.progress = SystemEnums.SolutionProgress.SUBMITTED;

        emit SolutionSubmitted(id, submittedAt);
    }

    function putSolutionUnderReview(
        bytes32 _challenge_id
    ) external onlyUserJoinedChallenge(msg.sender, _challenge_id) {
        bytes32 id = user_challenge_to_solution[msg.sender][_challenge_id];
        Solution storage sl = solutions[id];

        require(
            sl.progress == SystemEnums.SolutionProgress.SUBMITTED,
            "Solution not submitted"
        );

        sl.progress = SystemEnums.SolutionProgress.UNDER_REVIEW;

        // Initialize Evaluation Pool for this solution
        EvaluationPool storage pool = solution_to_evaluation_pool[id];
        pool.total_evaluators = SystemConsts.EVALUATION_QUORUM;
        pool.evaluation_count = 0;

        // Mark solution as under review
        is_under_review_solution[id] = true;
        solutions_under_review.push(id);

        emit SolutionPoolInitialized(id, block.timestamp * 1000);
    }

    function evaluatorJoinSolution(
        bytes32 _solution_id
    ) external onlySolutionUnderReview(_solution_id) onlyEvaluator(_solution_id) {
        //  Do not allow submitters to join the evaluation pool for their own solution
        require(
            solutions[_solution_id].user != msg.sender,
            "Cannot evaluate own solution"
        );

        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];

        // Check if the evaluator has already joined the evaluation pool
        require(
            !pool.evaluator_joined[msg.sender],
            "Already joined evaluation"
        );

        // Check if number of evaluators reach max
        require(
            pool.evaluator_list.length < pool.total_evaluators,
            "Evaluation pool full"
        );

        // Add solution ID to evaluator's list
        evaluator_to_solution[msg.sender].push(_solution_id);

        // Add evaluator to Evaluation Pool
        pool.evaluator_list.push(msg.sender);
        pool.evaluator_joined[msg.sender] = true;

        emit SolutionJoinedByEvaluator(
            msg.sender,
            _solution_id,
            block.timestamp
        );
    }

    function evaluatorSubmitScore(
        bytes32 _solution_id,
        uint256 _score
    ) external onlySolutionUnderReview(_solution_id) onlyEvaluator(_solution_id) {
        
        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];

        // Check if evaluator joined this solution
        require(pool.evaluator_joined[msg.sender], "Not joined evaluation");

        // Check if evaluator has not submitted score yet
        require(
            !pool.evaluator_submitted[msg.sender],
            "Already submitted score"
        );

        uint256 submittedAt = block.timestamp * 1000;

        // Store evaluation
        pool.evaluator_to_evaluation[msg.sender] = Evaluation({
            evaluator: msg.sender,
            evaluation_score: _score,
            submitted_at: submittedAt
        });
        // Update Evaluation Pool state
        pool.evaluator_submitted[msg.sender] = true;
        pool.evaluation_count++;

        emit SolutionScoreSubmittedByEvaluator(
            msg.sender,
            _solution_id,
            _score,
            submittedAt
        );

        // Check if all evaluators has submitted score
        if (pool.evaluation_count == pool.total_evaluators) {
            finalizeEvaluation(_solution_id);
        }
    }

    function finalizeEvaluation(
        bytes32 _solution_id
    ) internal onlySolutionUnderReview(_solution_id) {
        Solution storage sl = solutions[_solution_id];
        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];
        SystemEnums.Domain domain = challenge_manager.getChallengeDomainById(
            sl.challenge_id
        );

        // Calculate the final score from the evaluators's scores
        uint256 total_score = 0;
        uint256 total_reputation_weight = 0;
        // Cache number of evaluators
        uint256 evaluatorCount = pool.evaluator_list.length;

        for (uint256 i = 0; i < evaluatorCount; i++) {
            address evaluator = pool.evaluator_list[i];
            Evaluation storage evaluation = pool.evaluator_to_evaluation[
                evaluator
            ];

            int256 evaluator_domain_reputation = reputation_manager
                .getDomainReputation(evaluator, domain);

            uint256 reputation_weight = evaluator_domain_reputation < 0
                ? 0
                : uint256(evaluator_domain_reputation);

            total_score += evaluation.evaluation_score * reputation_weight;
            total_reputation_weight += reputation_weight;
        }

        uint256 final_score = total_score / total_reputation_weight;

        // Update solution result
        sl.score = final_score;
        sl.progress = SystemEnums.SolutionProgress.REVIEWED;
        // Update completed timestamp
        uint256 done_at = block.timestamp * 1000;
        pool.completed_at = done_at;

        // Remove from under review tracking
        is_under_review_solution[_solution_id] = false;
        // Remove solution from solutions_under_review array
        for (uint256 i = 0; i < solutions_under_review.length; i++) {
            if (solutions_under_review[i] == _solution_id) {
                // Replace with the last element and pop
                solutions_under_review[i] = solutions_under_review[
                    solutions_under_review.length - 1
                ];
                solutions_under_review.pop();
                break;
            }
        }

        emit SolutionEvaluationFinalized(_solution_id, final_score, done_at);

        // Update number of completed user for this challenge
        challenge_manager.userCompleteChallenge(sl.challenge_id);

        // Update submitter's reputation score
        reputation_manager.updateSolvingProblemReputation(
            sl.user,
            domain,
            final_score,
            SystemConsts.THRESHOLD_OF_SOLVING_PROBLEM_SCORE,
            SystemConsts.SCALING_CONSTANT_FOR_SOLVING_PROBLEM,
            challenge_manager.getChallengeDifficultyById(sl.challenge_id)
        );

        // Update evaluators' reputation score
        for (uint256 i = 0; i < evaluatorCount; i++) {
            address evalutor_address = pool.evaluator_list[i];
            Evaluation storage evaluation = pool.evaluator_to_evaluation[
                evalutor_address
            ];

            reputation_manager.updateEvaluateSolutionReputation(
                evalutor_address,
                domain,
                final_score,
                evaluation.evaluation_score,
                SystemConsts.THRESHOLD_OF_EVALUATION_DEVIATION,
                SystemConsts.SCALING_CONSTANT_FOR_EVALUATION
            );
        }

        // Finalize the solution evaluation without token distribution
    }

    // ================= SETTER METHODS =================
    function setChallengeManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        challenge_manager_address = _address;
        challenge_manager = IChallengeManager(_address);
    }

    function setReputationManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        reputation_manager_address = _address;
        reputation_manager = IReputationManager(_address);
    }

    function setRoleManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid address");
        role_manager_address = _address;
        role_manager = IRoleManager(_address);
    }

    // ================= GETTER METHODS =================
    function getSolutionTxIdById(
        bytes32 _solution_id
    ) public view returns (string memory) {
        return solutions[_solution_id].solution_txid;
    }

    function getSolutionTxIdByUserAndChallengeId(
        address _user_address,
        bytes32 _challenge_id
    )
        public
        view
        onlyUserJoinedChallenge(_user_address, _challenge_id)
        returns (string memory)
    {
        return
            solutions[user_challenge_to_solution[_user_address][_challenge_id]]
                .solution_txid;
    }

    function getSolutionById(
        bytes32 _solution_id
    ) public view returns (Solution memory) {
        return solutions[_solution_id];
    }

    function getSolutionByUserAndChallengeId(
        address _user_address,
        bytes32 _challenge_id
    )
        public
        view
        onlyUserJoinedChallenge(_user_address, _challenge_id)
        returns (Solution memory)
    {
        return
            solutions[user_challenge_to_solution[_user_address][_challenge_id]];
    }

    function getBriefSolutionInfo(
        address _user_address,
        bytes32 _challenge_id
    ) public view returns (SystemEnums.SolutionProgress, uint256, uint256) {
        Solution memory sl = solutions[
            user_challenge_to_solution[_user_address][_challenge_id]
        ];

        return (sl.progress, sl.created_at, sl.score);
    }

    function getSolutionByEvaluator(
        address _evaluator_address
    ) public view returns (Solution[] memory) {
        bytes32[] memory solutionIds = evaluator_to_solution[
            _evaluator_address
        ];

        Solution[] memory solutionList = new Solution[](solutionIds.length);

        for (uint256 i = 0; i < solutionIds.length; i++) {
            solutionList[i] = solutions[solutionIds[i]];
        }

        return solutionList;
    }

    function getUnderReviewSolution() public view returns (Solution[] memory) {
        uint256 count = solutions_under_review.length;
        Solution[] memory solutionList = new Solution[](count);

        for (uint256 i = 0; i < count; i++) {
            solutionList[i] = solutions[solutions_under_review[i]];
        }

        return solutionList;
    }

    function getMaxEvaluatorsForSolution(
        bytes32 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].total_evaluators;
    }

    function getNumberOfJoinedEvaluators(
        bytes32 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].evaluator_list.length;
    }

    function getNumberOfSubmittedEvaluations(
        bytes32 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].evaluation_count;
    }

    function getTimestampEvaluationCompleted(
        bytes32 _solution_id
    ) public view returns (uint256) {
        require(
            solutions[_solution_id].progress ==
                SystemEnums.SolutionProgress.REVIEWED,
            "Solution hasn't been evaluated yet"
        );

        return solution_to_evaluation_pool[_solution_id].completed_at;
    }

    function getScoreSubmittedByEvaluator(
        address _evaluator_address,
        bytes32 _solution_id
    ) public view returns (uint256) {
        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];

        require(
            pool.evaluator_joined[_evaluator_address] &&
                pool.evaluator_submitted[_evaluator_address],
            "Evaluator not submitted score"
        );

        return
            pool.evaluator_to_evaluation[_evaluator_address].evaluation_score;
    }

    function getTimestampScoreSubmittedByEvaluator(
        address _evaluator_address,
        bytes32 _solution_id
    ) public view returns (uint256) {
        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];

        require(
            pool.evaluator_joined[_evaluator_address] &&
                pool.evaluator_submitted[_evaluator_address],
            "Evaluator not submitted score"
        );

        return pool.evaluator_to_evaluation[_evaluator_address].submitted_at;
    }

    function checkUserJoinedChallenge(
        address _user_address,
        bytes32 _challenge_id
    ) public view returns (bool) {
        return is_user_joined_challenge[_user_address][_challenge_id];
    }

    function checkEvaluatorJoinedSolution(
        address _evaluator_address,
        bytes32 _solution_id
    ) public view returns (bool) {
        return
            solution_to_evaluation_pool[_solution_id].evaluator_joined[
                _evaluator_address
            ];
    }

    function checkEvalutorSubmittedScore(
        address _evaluator_address,
        bytes32 _solution_id
    ) public view returns (bool) {
        return
            solution_to_evaluation_pool[_solution_id].evaluator_submitted[
                _evaluator_address
            ];
    }

    function getEvaluationDeviation(
        address _evaluator_address,
        bytes32 _solution_id
    ) public view returns (uint256) {
        require(
            solutions[_solution_id].progress ==
                SystemEnums.SolutionProgress.REVIEWED,
            "Solution not yet evaluated"
        );

        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];

        require(
            pool.evaluator_joined[_evaluator_address] &&
                pool.evaluator_submitted[_evaluator_address],
            "Evaluator not submitted score"
        );

        uint256 evaluatorScore = pool
            .evaluator_to_evaluation[_evaluator_address]
            .evaluation_score;
        uint256 finalScore = solutions[_solution_id].score;

        // Return absolute difference
        return
            evaluatorScore > finalScore
                ? evaluatorScore - finalScore
                : finalScore - evaluatorScore;
    }
}
