// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Constants.sol";

// TODO: add access control to the modules. Currently, anyone can call the update functions.
contract ReputationManager {
    // ================== LOCAL CONSTANTS ==================
    uint256 public constant N_DOMAIN = 14; // Maximum number of domains

    // domain-specific reputation: user => domain => score (can be negative)
    mapping(address => mapping(SystemEnums.Domain => int256))
        public domain_reputation;

    // global reputation = sum of all domainReputation
    mapping(address => int256) public global_reputation;

    // --- EVENTS ---
    event ReputationChanged(
        address indexed _user,
        SystemEnums.Domain indexed _domain,
        int256 _delta,
        int256 _new_domain_score,
        int256 _new_global_score
    );
    event ModuleUpdated(string _module_type, address _module_address);

    // --- MODIFIERS ---
    // TODO: add access control to the modules

    modifier ensureValidValues(uint256 _threshold) {
        require(
            _threshold > 0 && _threshold < Weights.BASE_WEIGHT,
            "Invalid threshold value"
        );
        _;
    }

    // --- ADMIN FUNCTIONS ---
    // TODO: add admin functions to the modules for updating after deployment

    // --- UPDATE FUNCTIONS ---
    /// @notice Called after a solution is finalized -> Update the user's reputation who submitted the solution
    /// @param _user                address whose reputation to update
    /// @param _domain              the challenge domain
    /// @param _final_score         the consolidated solution score
    /// @param _threshold           threshold for no-change
    /// @param _scaling_constant    scaling constant
    /// @param _difficulty          weight of challenge difficulty
    function updateSolvingProblemReputation(
        address _user,
        SystemEnums.Domain _domain,
        uint256 _final_score,
        uint256 _threshold,
        uint256 _scaling_constant,
        SystemEnums.DifficultyLevel _difficulty
    ) external ensureValidValues(_threshold) {
        int256 delta;
        delta = _computeDeltaBasedOnScore(
            _final_score,
            _threshold,
            _scaling_constant,
            _difficulty
        );
        _applyReputationChange(_user, _domain, delta);
    }

    /// @notice Called after a solution is finalized -> Update the reviewer's reputation who reviewed the solution
    /// @param _reviewer            address to update
    /// @param _domain              domain of the challenge reviewed
    /// @param _final_score         the finalized score
    /// @param _evaluate_score      the score given by the reviewer
    /// @param _threshold           allowable deviation for no-change
    /// @param _scaling_constant    scaling constant
    function updateEvaluateSolutionReputation(
        address _reviewer,
        SystemEnums.Domain _domain,
        uint256 _final_score,
        uint256 _evaluate_score,
        uint256 _threshold,
        uint256 _scaling_constant
    ) external ensureValidValues(_threshold) {
        int256 delta;
        uint256 deviation = _final_score > _evaluate_score
            ? (_final_score - _evaluate_score)
            : (_evaluate_score - _final_score);

        delta = _computeDeltaScoreBasedOnDeviation(
            deviation,
            _threshold,
            _scaling_constant
        );
        _applyReputationChange(_reviewer, _domain, delta);
    }

    /// @notice Called after a challenge is finalized -> Update the contributor's reputation who made the challenge
    /// @param _contributor         address to update
    /// @param _domain              domain of the challenge
    /// @param _quality_score       the final quality score
    /// @param _threshold           threshold for no-change
    /// @param _scaling_constant    scaling constant
    /// @param _difficulty          consolidated difficulty of the challenge (after moderation)
    function updateContributionReputation(
        address _contributor,
        SystemEnums.Domain _domain,
        uint256 _quality_score,
        uint256 _threshold,
        uint256 _scaling_constant,
        SystemEnums.DifficultyLevel _difficulty
    ) external ensureValidValues(_threshold) {
        int256 delta;

        delta = _computeDeltaBasedOnScore(
            _quality_score,
            _threshold,
            _scaling_constant,
            _difficulty
        );
        _applyReputationChange(_contributor, _domain, delta);
    }

    /// @notice Called after a challenge is finalized -> Update the moderator's reputation who review the challenge
    /// @param _moderator           address to update
    /// @param _domain              domain of the challenge they moderated
    /// @param _quality_score       the final quality score
    /// @param _review_score        the score given by the moderator
    /// @param _threshold           allowable deviation for no-change
    /// @param _scaling_constant    scaling constant
    function updateModerationReputation(
        address _moderator,
        SystemEnums.Domain _domain,
        uint256 _quality_score,
        uint256 _review_score,
        uint256 _threshold,
        uint256 _scaling_constant
    ) external ensureValidValues(_threshold) {
        int256 delta;
        uint256 deviation = _quality_score > _review_score
            ? (_quality_score - _review_score)
            : (_review_score - _quality_score);

        delta = _computeDeltaScoreBasedOnDeviation(
            deviation,
            _threshold,
            _scaling_constant
        );
        _applyReputationChange(_moderator, _domain, delta);
    }

    // --- INTERNAL FUNCTIONS ---
    function _applyReputationChange(
        address _user,
        SystemEnums.Domain _domain,
        int256 _delta
    ) internal {
        if (_delta == 0) {
            console.log("No change in reputation (delta = 0) for user %s", _user);
            return;
        }

        int256 _old_domain = domain_reputation[_user][_domain];
        int256 _new_domain = _old_domain + _delta;
        domain_reputation[_user][_domain] = _new_domain;

        // update global
        int256 _old_global = global_reputation[_user];
        int256 _new_global = _old_global + _delta;
        global_reputation[_user] = _new_global;

        emit ReputationChanged(
            _user,
            _domain,
            _delta,
            _new_domain,
            _new_global
        );

        console.log("Reputation changed for user %s", _user);
        console.logInt(_delta);
    }

    function _computeDeltaBasedOnScore(
        uint256 _final_score,
        uint256 _threshold,
        uint256 _scaling_constant,
        SystemEnums.DifficultyLevel _difficulty
    ) internal pure returns (int256) {
        uint256 difficulty_weight = Weights.getDifficultyWeight(_difficulty);
        int256 delta;
        if (_final_score < _threshold) {
            delta = -int256(
                MathUtils.mulConst(
                    _scaling_constant,
                    MathUtils.mulConst(
                        difficulty_weight,
                        Weights.BASE_WEIGHT -
                            ((Weights.BASE_WEIGHT * _final_score) / _threshold)
                    )
                )
            );
        } else if (_final_score > _threshold) {
            delta = int256(
                MathUtils.mulConst(
                    _scaling_constant,
                    MathUtils.mulConst(
                        difficulty_weight,
                        (Weights.BASE_WEIGHT * (_final_score - _threshold)) /
                            (Weights.BASE_WEIGHT - _threshold)
                    )
                )
            );
        } else {
            delta = 0;
        }
        return delta;
    }

    function _computeDeltaScoreBasedOnDeviation(
        uint256 deviation,
        uint256 _threshold,
        uint256 _scaling_constant
    ) internal pure returns (int256) {
        int256 delta;

        if (deviation < _threshold) {
            delta = int256(
                MathUtils.mulConst(
                    _scaling_constant,
                    Weights.BASE_WEIGHT -
                        ((Weights.BASE_WEIGHT * deviation) / _threshold)
                )
            );
        } else if (deviation > _threshold) {
            delta = -int256(
                MathUtils.mulConst(
                    _scaling_constant,
                    (Weights.BASE_WEIGHT * (deviation - _threshold)) /
                        (Weights.BASE_WEIGHT - _threshold)
                )
            );
        } else {
            delta = 0;
        }
        return delta;
    }

    // --- GETTER FUNCTIONS ---
    function getDomainReputation(
        address _user,
        SystemEnums.Domain _domain
    ) external view returns (int256) {
        return domain_reputation[_user][_domain];
    }

    function getAllDomainReputation(address _user)
        external
        view
        returns (int256[N_DOMAIN] memory)
    {
        int256[N_DOMAIN] memory domain_reputation_array;
        for (uint256 i = 0; i < N_DOMAIN; i++) {
            domain_reputation_array[i] = domain_reputation[_user][
                SystemEnums.Domain(i)
            ];
        }
        return domain_reputation_array;
    }

    function getGlobalReputation(address _user) external view returns (int256) {
        return global_reputation[_user];
    }
}
