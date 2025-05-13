// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

// ================= ENUMS =================
enum SolutionProgress {
    IN_PROGRESS,
    SUBMITTED,
    UNDER_REVIEW,
    REVIEWED
}

contract SolutionManager {
    // ================= STRUCTS =================
    struct Solution {
        address user;
        uint256 challenge_id;
        string solution_txid;
        uint256 created_at;
        uint256 submitted_at;
        SolutionProgress progress;
        uint256 score;
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

    uint256 private total_solutions = 0;

    // ================= EVENTS =================
    event SolutionBaseCreated(
        address user_address,
        uint256 challenge_id,
        string solution_base_txid,
        uint256 created_at
    );

    event SolutionSubmitted(uint256 submitted_at);

    // ================= SOLUTION INTERFACTION METHODS =================
    function createSolutionBase(
        address _user_address,
        uint256 _challenge_id,
        string calldata _solution_base_txid,
        uint256 _created_at
    ) external {
        uint256 solutionId = total_solutions++;

        solutions[solutionId] = Solution({
            user: _user_address,
            challenge_id: _challenge_id,
            solution_txid: _solution_base_txid,
            created_at: _created_at,
            submitted_at: 0,
            progress: SolutionProgress.IN_PROGRESS,
            score: 0
        });

        user_challenge_to_solution[_challenge_id][_user_address] = solutionId;
        user_challenge_to_join_state[_challenge_id][_user_address] = true;
        console.log(
            "Created solution base with txid %s of challenge %s for user %s",
            _solution_base_txid,
            _challenge_id,
            _user_address
        );

        emit SolutionBaseCreated(
            _user_address,
            _challenge_id,
            _solution_base_txid,
            _created_at
        );
    }

    function submitSolution(uint256 _challenge_id) external {
        require(user_challenge_to_join_state[_challenge_id][msg.sender]);

        Solution storage solution = solutions[
            user_challenge_to_solution[_challenge_id][msg.sender]
        ];

        solution.submitted_at = block.timestamp * 1000;
        solution.progress = SolutionProgress.SUBMITTED;

        console.log(
            "User %s submmitted solution with txid %s for challenge #%s",
            msg.sender,
            solution.solution_txid,
            _challenge_id
        );
        console.log("at %s", solution.submitted_at);

        emit SolutionSubmitted(solution.submitted_at);
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
        returns (uint256 created_at, SolutionProgress progress, uint256 score)
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

    function checkUserJoinedChallenge(
        address _user_address,
        uint256 _challenge_id
    ) public view returns (bool) {
        return user_challenge_to_join_state[_challenge_id][_user_address];
    }
}
