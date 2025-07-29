// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";
import "./Constants.sol";
import "./Formulas.sol";
import "./interfaces/IRoleManager.sol";

/**
 *  The contract ReputationManager have a role REPUTATION_UPDATER_ROLE
 */

contract ReputationManager is AccessControl {
    // ============================== LOCAL CONSTANTS ==============================
    uint256 public constant N_DOMAIN = 14; // Maximum number of domains

    // ============================== ROLE CONSTANTS ==============================
    bytes32 public constant REPUTATION_UPDATER_ROLE =
        keccak256("REPUTATION_UPDATER_ROLE");

    // ============================== STATE VARIABLES ==============================
    // domain-specific reputation: user => domain => score (can be negative)
    mapping(address => mapping(SystemEnums.Domain => int256))
        public domain_reputation;

    // global reputation = average of all domain reputations
    mapping(address => int256) public global_reputation;

    // Reference to RoleManager contract
    IRoleManager private role_manager;

    // ============================== EVENTS ==============================
    event ReputationChanged(
        address indexed _user,
        SystemEnums.Domain indexed _domain,
        int256 _delta,
        int256 _new_domain_score,
        int256 _new_global_score
    );
    event ModuleUpdated(string _module_type, address _module_address);

    // ============================== MODIFIERS ==============================
    modifier ensureValidValues(uint256 _threshold) {
        require(
            _threshold > 0 && _threshold < Weights.BASE_WEIGHT,
            "Invalid threshold value"
        );
        _;
    }

    // ============================== CONSTRUCTOR ==============================
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ============================== ADMIN FUNCTIONS ==============================

    /// @notice Grant REPUTATION_UPDATER_ROLE to a contract address
    /// @param _contractAddress Address of the contract to grant the role to
    function grantReputationUpdaterRole(
        address _contractAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_contractAddress != address(0), "Invalid contract address");
        _grantRole(REPUTATION_UPDATER_ROLE, _contractAddress);
    }

    /// @notice Set the RoleManager contract address
    /// @param _role_manager Address of the RoleManager contract
    function setRoleManagerAddress(
        address _role_manager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_role_manager != address(0), "Invalid role manager address");
        role_manager = IRoleManager(_role_manager);
        emit ModuleUpdated("RoleManager", _role_manager);
    }

    /// @notice Emergency function to directly adjust user's reputation
    /// @param _user User address whose reputation to adjust
    /// @param _domain Domain to adjust reputation for
    /// @param _delta Amount to add (positive) or subtract (negative) from reputation
    /// @dev This function should only be used in emergency situations by admin
    function emergencyAdjustReputation(
        address _user,
        SystemEnums.Domain _domain,
        int256 _delta
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_user != address(0), "Invalid user address");
        require(_delta != 0, "Delta cannot be zero");

        _applyReputationChange(_user, _domain, _delta);

        console.log("Emergency reputation adjustment for user %s", _user);
        console.logInt(_delta);
    }

    // ============================== UPDATE FUNCTIONS ==============================
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
    ) external ensureValidValues(_threshold) onlyRole(REPUTATION_UPDATER_ROLE) {
        int256 delta;
        delta = ReputationFormulas.computeDeltaBasedOnScore(
            _final_score,
            _threshold,
            _scaling_constant,
            _difficulty,
            SystemConsts.MAX_REWARD_REPUTATION_SCORE_FOR_SOLVING_PROBLEM,
            SystemConsts.MAX_PENALTY_REPUTATION_SCORE_FOR_SOLVING_PROBLEM
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
    ) external ensureValidValues(_threshold) onlyRole(REPUTATION_UPDATER_ROLE) {
        int256 delta;
        uint256 deviation = _final_score > _evaluate_score
            ? (_final_score - _evaluate_score)
            : (_evaluate_score - _final_score);

        delta = ReputationFormulas.computeDeltaScoreBasedOnDeviation(
            deviation,
            _threshold,
            _scaling_constant,
            SystemConsts.MAX_REWARD_REPUTATION_SCORE_FOR_EVALUATION,
            SystemConsts.MAX_PENALTY_REPUTATION_SCORE_FOR_EVALUATION
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
    ) external ensureValidValues(_threshold) onlyRole(REPUTATION_UPDATER_ROLE) {
        int256 delta;

        delta = ReputationFormulas.computeDeltaBasedOnScore(
            _quality_score,
            _threshold,
            _scaling_constant,
            _difficulty,
            SystemConsts.MAX_REWARD_REPUTATION_SCORE_FOR_CONTRIBUTION,
            SystemConsts.MAX_PENALTY_REPUTATION_SCORE_FOR_CONTRIBUTION
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
    ) external ensureValidValues(_threshold) onlyRole(REPUTATION_UPDATER_ROLE) {
        int256 delta;
        uint256 deviation = _quality_score > _review_score
            ? (_quality_score - _review_score)
            : (_review_score - _quality_score);

        delta = ReputationFormulas.computeDeltaScoreBasedOnDeviation(
            deviation,
            _threshold,
            _scaling_constant,
            SystemConsts.MAX_REWARD_REPUTATION_SCORE_FOR_MODERATION,
            SystemConsts.MAX_PENALTY_REPUTATION_SCORE_FOR_MODERATION
        );
        _applyReputationChange(_moderator, _domain, delta);
    }

    // ============================== INTERNAL FUNCTIONS ==============================
    function _applyReputationChange(
        address _user,
        SystemEnums.Domain _domain,
        int256 _delta
    ) internal {
        if (_delta == 0) {
            console.log(
                "No change in reputation (delta = 0) for user %s",
                _user
            );
            return;
        }

        int256 _old_domain = domain_reputation[_user][_domain];
        int256 _new_domain = _old_domain + _delta;
        // Clamp domain reputation within [0, MAX_REPUTATION_SCORE]
        if (_new_domain < 0) {
            _new_domain = 0;
        } else if (_new_domain > int256(SystemConsts.MAX_REPUTATION_SCORE)) {
            _new_domain = int256(SystemConsts.MAX_REPUTATION_SCORE);
        }
        domain_reputation[_user][_domain] = _new_domain;

        // update global reputation as the average score across all domains
        int256 total;
        for (uint256 i = 0; i < N_DOMAIN; i++) {
            total += domain_reputation[_user][SystemEnums.Domain(i)];
        }
        int256 _new_global = total / int256(N_DOMAIN);
        if (_new_global < 0) {
            _new_global = 0;
        } else if (_new_global > int256(SystemConsts.MAX_REPUTATION_SCORE)) {
            _new_global = int256(SystemConsts.MAX_REPUTATION_SCORE);
        }
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

        // Check and update roles based on new global reputation
        if (address(role_manager) != address(0)) {
            // Check all available roles for potential grant/revoke
            bytes32[3] memory roles = [
                role_manager.CONTRIBUTOR_ROLE(),
                role_manager.EVALUATOR_ROLE(),
                role_manager.MODERATOR_ROLE()
            ];

            for (uint i = 0; i < roles.length; i++) {
                // Check if user should be granted role for this domain
                role_manager.checkAndGrantRole(_user, roles[i], _domain);

                // Check if user should lose role due to reputation decline
                role_manager.checkAndRevokeRole(_user, roles[i], _domain);
            }
        }
    }

    // ============================== GETTER FUNCTIONS ==============================
    function getDomainReputation(
        address _user,
        SystemEnums.Domain _domain
    ) external view returns (int256) {
        return domain_reputation[_user][_domain];
    }

    function getAllDomainReputation(
        address _user
    ) external view returns (int256[N_DOMAIN] memory) {
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
