// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Constants.sol";
import "./ReputationManager.sol";
import "./ChallengeManager.sol";

contract SolutionManager {
    // ================= STRUCTS =================
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

    struct EvaluationPool {
        uint256 total_evaluators;
        uint256 evaluation_count;
        address[] evaluator_list;
        mapping(address => bool) evaluator_joined;
        mapping(address => bool) evaluator_submitted;
        mapping(address => Evaluation) evaluator_to_evaluation;
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

    // ================= STATE VARIABLES =================
    // Mapping: Solution ID -> Solution
    mapping(uint256 => Solution) private solutions;
    // Mapping: Challenge ID + User address -> Solution ID)
    mapping(uint256 => mapping(address => uint256))
        private user_challenge_to_solution;
    // Mapping: Challenge ID + User address -> Check if user has joined this challenge
    mapping(uint256 => mapping(address => bool))
        private user_challenge_to_join_state;
    // Mapping: Evaluator address -> Solution IDs for evaluation pool
    mapping(address => uint256[]) private evaluator_to_solution;
    // Mapping: Solution ID -> Evaluation Pool
    mapping(uint256 => EvaluationPool) private solution_to_evaluation_pool;

    ChallengeManager private challenge_manager; // ChallengeManager instance
    address private challenge_manager_address; // ChallengeManager address
    ReputationManager private reputation_manager; // ReputationManager instance
    address private reputation_manager_address; // ReputationManager address

    uint256 private total_solutions = 0;
    uint256 private under_review_solutions = 0;

    // ================= EVENTS =================
    event SolutionBaseCreated(
        address user_address,
        uint256 challenge_id,
        string solution_base_txid,
        uint256 created_at
    );

    event SolutionSubmitted(uint256 solution_id, uint256 submitted_at);

    event SolutionPoolInitialized(uint256 solution_id, uint256 initialized_at);

    event SolutionJoinedByEvaluator(
        address evaluator,
        uint256 solution_id,
        uint256 joined_at
    );

    event SolutionScoreSubmittedByEvaluator(
        address evaluator,
        uint256 solution_id,
        uint256 score,
        uint256 submitted_at
    );

    event SolutionEvaluationFinalized(
        uint256 solution_id,
        uint256 score,
        uint256 finalized_at
    );

    // ================= MODIFIER =================
    modifier onlyUserJoinedChallenge(
        address _user_address,
        uint256 _challenge_id
    ) {
        require(user_challenge_to_join_state[_challenge_id][_user_address]);
        _;
    }

    modifier onlySolutionUnderReview(uint256 _solution_id) {
        require(
            solutions[_solution_id].progress ==
                SystemEnums.SolutionProgress.UNDER_REVIEW
        );
        _;
    }

    // ================= SOLUTION INTERFACTION METHODS =================
    function createSolutionBase(
        address _user_address,
        uint256 _challenge_id,
        string calldata _solution_base_txid,
        uint256 _created_at
    ) external {
        uint256 solutionId = total_solutions++;

        solutions[solutionId] = Solution({
            id: solutionId,
            user: _user_address,
            challenge_id: _challenge_id,
            solution_txid: _solution_base_txid,
            created_at: _created_at,
            submitted_at: 0,
            progress: SystemEnums.SolutionProgress.IN_PROGRESS,
            score: 0
        });

        user_challenge_to_solution[_challenge_id][_user_address] = solutionId;
        user_challenge_to_join_state[_challenge_id][_user_address] = true;
        console.log(
            "Created solution base #%s of challenge %s for user %s",
            solutionId,
            _challenge_id,
            _user_address
        );
        console.log("with txid %s", _solution_base_txid);

        emit SolutionBaseCreated(
            _user_address,
            _challenge_id,
            _solution_base_txid,
            _created_at
        );
    }

    function submitSolution(
        uint256 _challenge_id
    ) external onlyUserJoinedChallenge(msg.sender, _challenge_id) {
        Solution storage solution = solutions[
            user_challenge_to_solution[_challenge_id][msg.sender]
        ];

        solution.submitted_at = block.timestamp * 1000;
        solution.progress = SystemEnums.SolutionProgress.SUBMITTED;

        console.log(
            "User %s submmitted solution #%s for challenge #%s",
            msg.sender,
            solution.id,
            _challenge_id
        );
        console.log("at %s", solution.submitted_at);

        emit SolutionSubmitted(solution.id, solution.submitted_at);
    }

    function putSolutionUnderReview(
        uint256 _challenge_id
    ) external onlyUserJoinedChallenge(msg.sender, _challenge_id) {
        uint256 solutionId = user_challenge_to_solution[_challenge_id][
            msg.sender
        ];

        Solution storage solution = solutions[solutionId];

        require(solution.progress == SystemEnums.SolutionProgress.SUBMITTED);

        uint256 _put_at = block.timestamp * 1000;
        solution.progress = SystemEnums.SolutionProgress.UNDER_REVIEW;

        EvaluationPool storage pool = solution_to_evaluation_pool[solutionId];

        pool.total_evaluators = 3; // Maybe submitter can assign total evaluators
        pool.evaluation_count = 0;
        under_review_solutions++;

        console.log(
            "User %s have put solution #%s under review at %s",
            msg.sender,
            solution.id,
            _put_at
        );

        emit SolutionPoolInitialized(solutionId, _put_at);
    }

    function evaluatorJoinSolution(
        uint256 _solution_id
    ) external onlySolutionUnderReview(_solution_id) {
        //  Do not allow submitters to join the evaluation pool for their own solution
        require(solutions[_solution_id].user != msg.sender);

        // Check if the evaluator has already joined the evaluation pool
        require(
            !solution_to_evaluation_pool[_solution_id].evaluator_joined[
                msg.sender
            ]
        );

        // Check if number of evaluators reach max
        require(
            solution_to_evaluation_pool[_solution_id].evaluator_list.length <
                solution_to_evaluation_pool[_solution_id].total_evaluators
        );

        evaluator_to_solution[msg.sender].push(_solution_id);

        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];
        pool.evaluator_list.push(msg.sender);
        pool.evaluator_joined[msg.sender] = true;

        console.log(
            "Evaluator %s joined evaluation pool for solution #%s",
            msg.sender,
            _solution_id
        );

        emit SolutionJoinedByEvaluator(
            msg.sender,
            _solution_id,
            block.timestamp * 1000
        );
    }

    function evaluatorSubmitScore(
        uint256 _solution_id,
        uint256 _score
    ) external onlySolutionUnderReview(_solution_id) {
        // Check if evaluator joined this solution
        require(
            solution_to_evaluation_pool[_solution_id].evaluator_joined[
                msg.sender
            ]
        );

        // Check if evaluator has not submitted score yet
        require(
            !solution_to_evaluation_pool[_solution_id].evaluator_submitted[
                msg.sender
            ]
        );

        uint256 submittedAt = block.timestamp * 1000;

        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];
        pool.evaluator_to_evaluation[msg.sender] = Evaluation({
            evaluator: msg.sender,
            evaluation_score: _score,
            submitted_at: submittedAt
        });
        pool.evaluator_submitted[msg.sender] = true;
        pool.evaluation_count++;

        console.log(
            "Evaluator %s give score %s to solution #%s",
            msg.sender,
            _score,
            _solution_id
        );

        emit SolutionScoreSubmittedByEvaluator(
            msg.sender,
            _solution_id,
            _score,
            submittedAt
        );

        if (pool.evaluation_count == pool.total_evaluators)
            finalizeEvaluation(_solution_id);
    }

    function finalizeEvaluation(
        uint256 _solution_id
    ) internal onlySolutionUnderReview(_solution_id) {
        Solution storage sl = solutions[_solution_id];
        EvaluationPool storage pool = solution_to_evaluation_pool[_solution_id];
        SystemEnums.Domain domain = challenge_manager.getChallengeDomainById(
            sl.challenge_id
        );

        // Calculate the average score from the evaluators's scores
        uint256 total_score = 0;
        uint256 total_reputation_weight = 0;
        for (uint256 i = 0; i < pool.evaluator_list.length; i++) {
            Evaluation storage evaluation = pool.evaluator_to_evaluation[
                pool.evaluator_list[i]
            ];
            int256 evaluator_domain_reputation = reputation_manager
                .getDomainReputation(evaluation.evaluator, domain);

            uint256 reputation_weight = SystemConsts
                .REPUTATION_WEIGHT_FOR_SCORING +
                uint256(evaluator_domain_reputation);

            total_score += evaluation.evaluation_score * reputation_weight;
            total_reputation_weight += reputation_weight;
        }

        uint256 final_score = total_score / total_reputation_weight;

        console.log(
            "Average score for solution #%s: %s",
            _solution_id,
            final_score
        );

        // Update solution result
        sl.score = final_score;
        sl.progress = SystemEnums.SolutionProgress.REVIEWED;
        under_review_solutions--;

        emit SolutionEvaluationFinalized(
            _solution_id,
            final_score,
            block.timestamp * 1000
        );

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

        console.log(
            "Updated reputation for user %s for solving solution %s",
            sl.user,
            sl.id
        );

        // Update evaluators' reputation score
        for (uint256 i = 0; i < pool.evaluator_list.length; i++) {
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

            console.log(
                "Updated reputation for evaluator %s for evaluating solution %s",
                evalutor_address,
                sl.id
            );
        }
    }

    // ================= SETTER METHODS =================
    function setChallengeManagerAddress(address _address) external {
        require(_address != address(0), "Invalid address");
        challenge_manager_address = _address;
        challenge_manager = ChallengeManager(_address);
    }

    function setReputationManagerAddress(address _address) external {
        require(_address != address(0), "Invalid address");
        reputation_manager_address = _address;
        reputation_manager = ReputationManager(_address);
    }

    // ================= GETTER METHODS =================
    function getSolutionTxId(
        address _user_address,
        uint256 _challenge_id
    ) public view returns (string memory) {
        require(user_challenge_to_join_state[_challenge_id][_user_address]);

        return
            solutions[user_challenge_to_solution[_challenge_id][_user_address]]
                .solution_txid;
    }

    function getSolutionPreviewByUserAndChallengeId(
        address _user_address,
        uint256 _challenge_id
    )
        public
        view
        returns (
            uint256 created_at,
            SystemEnums.SolutionProgress progress,
            uint256 score
        )
    {
        Solution storage solution = solutions[
            user_challenge_to_solution[_challenge_id][_user_address]
        ];

        return (solution.created_at, solution.progress, solution.score);
    }

    function getSolutionByUserAndChallengeId(
        address _user_address,
        uint256 _challenge_id
    ) public view returns (Solution memory) {
        require(user_challenge_to_join_state[_challenge_id][_user_address]);

        console.log(
            "User %s fetched solution #%s of challenge #%s",
            _user_address,
            user_challenge_to_solution[_challenge_id][_user_address],
            _challenge_id
        );

        return
            solutions[user_challenge_to_solution[_challenge_id][_user_address]];
    }

    function getSolutionById(
        uint256 _solution_id
    ) public view returns (Solution memory) {
        require(_solution_id < total_solutions);

        console.log("Fetched solution #%s", _solution_id);

        return solutions[_solution_id];
    }

    function getSolutionByEvaluator(
        address _evaluator_address
    ) public view returns (UnderReviewSolutionPreview[] memory) {
        uint256[] memory solutionIds = evaluator_to_solution[
            _evaluator_address
        ];
        UnderReviewSolutionPreview[]
            memory solutionList = new UnderReviewSolutionPreview[](
                solutionIds.length
            );

        for (uint256 i = 0; i < solutionIds.length; i++) {
            uint256 index = solutionIds[i];

            solutionList[i] = UnderReviewSolutionPreview({
                id: solutions[index].id,
                submitter: solutions[index].user,
                challenge_title_url: challenge_manager.getChallengeTitleById(
                    solutions[index].challenge_id
                ),
                domain: challenge_manager.getChallengeDomainById(
                    solutions[index].challenge_id
                ),
                solution_txid: solutions[index].solution_txid,
                submitted_at: solutions[index].submitted_at,
                progress: solutions[index].progress,
                number_of_joined_evaluators: solution_to_evaluation_pool[index]
                    .evaluator_list
                    .length,
                total_evaluators: solution_to_evaluation_pool[index]
                    .total_evaluators
            });
        }

        console.log(
            "Evaluator %s had fetched %s joined solutions review",
            _evaluator_address,
            solutionIds.length
        );

        return solutionList;
    }

    function getUnderReviewSolutionPreview()
        public
        view
        returns (UnderReviewSolutionPreview[] memory)
    {
        UnderReviewSolutionPreview[]
            memory solutionList = new UnderReviewSolutionPreview[](
                under_review_solutions
            );
        uint256 count = 0;

        for (uint256 i = 0; i < total_solutions; i++) {
            if (
                solutions[i].progress ==
                SystemEnums.SolutionProgress.UNDER_REVIEW
            ) {
                solutionList[count] = UnderReviewSolutionPreview({
                    id: solutions[i].id,
                    submitter: solutions[i].user,
                    challenge_title_url: challenge_manager
                        .getChallengeTitleById(solutions[i].challenge_id),
                    domain: challenge_manager.getChallengeDomainById(
                        solutions[i].challenge_id
                    ),
                    solution_txid: solutions[i].solution_txid,
                    submitted_at: solutions[i].submitted_at,
                    progress: solutions[i].progress,
                    number_of_joined_evaluators: solution_to_evaluation_pool[i]
                        .evaluator_list
                        .length,
                    total_evaluators: solution_to_evaluation_pool[i]
                        .total_evaluators
                });
                count++;
            }
        }

        return solutionList;
    }

    function getMaxEvaluatorsForSolution(
        uint256 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].total_evaluators;
    }

    function getNumberOfJoinedEvaluators(
        uint256 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].evaluator_list.length;
    }

    function getNumberOfSubmittedEvaluations(
        uint256 _solution_id
    ) public view returns (uint256) {
        return solution_to_evaluation_pool[_solution_id].evaluation_count;
    }

    function getScoreSubmittedByEvaluator(
        address _evaluator_address,
        uint256 _solution_id
    ) public view returns (uint256) {
        require(
            solution_to_evaluation_pool[_solution_id].evaluator_joined[
                _evaluator_address
            ] &&
                solution_to_evaluation_pool[_solution_id].evaluator_submitted[
                    _evaluator_address
                ]
        );

        return
            solution_to_evaluation_pool[_solution_id]
                .evaluator_to_evaluation[_evaluator_address]
                .evaluation_score;
    }

    function checkUserJoinedChallenge(
        address _user_address,
        uint256 _challenge_id
    ) public view returns (bool) {
        return user_challenge_to_join_state[_challenge_id][_user_address];
    }

    function checkEvaluatorJoinedSolution(
        address _evaluator_address,
        uint256 _solution_id
    ) public view returns (bool) {
        return
            solution_to_evaluation_pool[_solution_id].evaluator_joined[
                _evaluator_address
            ];
    }

    function checkEvalutorSubmittedScore(
        address _evaluator_address,
        uint256 _solution_id
    ) public view returns (bool) {
        return
            solution_to_evaluation_pool[_solution_id].evaluator_submitted[
                _evaluator_address
            ];
    }
}
