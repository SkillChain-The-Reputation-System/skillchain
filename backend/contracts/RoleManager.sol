// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IReputationManager.sol";

/**
 * @title RoleManager
 * @dev Manages user roles with reputation-based requirements
 * @dev Roles: Regular User, Contributor, Evaluator, Moderator
 * @dev Each role requires a minimum global reputation score
 */
contract RoleManager is AccessControl {
    // ============================== ROLE CONSTANTS ==============================
    bytes32 public constant CONTRIBUTOR_ROLE = keccak256("CONTRIBUTOR_ROLE");
    bytes32 public constant EVALUATOR_ROLE = keccak256("EVALUATOR_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    // ============================== STATE VARIABLES ==============================
    IReputationManager public reputation_manager;

    // Minimum reputation requirements for each role
    mapping(bytes32 => int256) public role_reputation_requirements;

    // ============================== EVENTS ==============================
    event RoleRequirementUpdated(
        bytes32 indexed role,
        int256 oldRequirement,
        int256 newRequirement
    );
    event ReputationManagerUpdated(
        address indexed old_manager,
        address indexed new_manager
    );
    event RoleGrantedWithReputation(
        bytes32 indexed role,
        address indexed account,
        int256 reputation
    );
    event RoleRevokedDueToReputation(
        bytes32 indexed role,
        address indexed account,
        int256 reputation
    );

    // ============================== MODIFIERS ==============================
    /**
     * @dev Modifier to check if reputation manager address is set
     */
    
    modifier onlyWithReputationManager() {
        require(
            address(reputation_manager) != address(0),
            "Reputation manager not set"
        );
        _;
    }

    // ============================== CONSTRUCTOR ==============================
    constructor() {
        // Set initial reputation requirements
        role_reputation_requirements[CONTRIBUTOR_ROLE] = 50;
        role_reputation_requirements[EVALUATOR_ROLE] = 100;
        role_reputation_requirements[MODERATOR_ROLE] = 200;

        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ============================== ADMIN FUNCTIONS ==============================

    /**
     * @dev Set the ReputationManager contract address
     * @param _reputation_manager Address of the ReputationManager contract
     * @dev Can only be called by admin
     */
    
    function setReputationManagerAddress(
        address _reputation_manager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _reputation_manager != address(0),
            "Invalid reputation manager"
        );

        address old_manager = address(reputation_manager);
        reputation_manager = IReputationManager(_reputation_manager);

        emit ReputationManagerUpdated(old_manager, _reputation_manager);
    }

    /**
     * @dev Update reputation requirement for a specific role
     * @param role The role to update
     * @param _new_requirement The new minimum reputation requirement
     * @dev Can only be called by admin
     */
    function updateRoleRequirement(
        bytes32 role,
        int256 _new_requirement
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        int256 old_requirement = role_reputation_requirements[role];
        role_reputation_requirements[role] = _new_requirement;

        emit RoleRequirementUpdated(role, old_requirement, _new_requirement);
    }

    /**
     * @dev Emergency function to grant role without reputation check
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function emergencyGrantRole(
        bytes32 role,
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        _grantRole(role, account);
    }

    // ============================== PUBLIC FUNCTIONS ==============================

    /**
     * @dev Request a role based on current reputation
     * @param role The role to request
     */
    
    function requestRole(bytes32 role) external onlyWithReputationManager {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );
        int256 current_reputation = reputation_manager.getGlobalReputation(
            msg.sender
        );
        int256 required_reputation = role_reputation_requirements[role];

        require(
            current_reputation >= required_reputation,
            "Insufficient reputation score"
        );

        _grantRole(role, msg.sender);

        emit RoleGrantedWithReputation(role, msg.sender, current_reputation);
    }

    /**
     * @dev Check if an account can be granted a specific role based on reputation
     * @param role The role to check
     * @param account The account to check
     * @return can_grant Whether the account meets the reputation requirement
     * @return current_reputation The account's current reputation
     * @return required_reputation The required reputation for the role
     */ 
    function canGrantRole(
        bytes32 role,
        address account
    )
        external
        view
        onlyWithReputationManager
        returns (
            bool can_grant,
            int256 current_reputation,
            int256 required_reputation
        )
    {
        current_reputation = reputation_manager.getGlobalReputation(account);
        required_reputation = role_reputation_requirements[role];
        can_grant = current_reputation >= required_reputation;
    }

    /**
     * @dev Check if a user should lose a role due to reputation decline
     * @param account The account to check
     * @param role The role to check
     * @return should_revoke Whether the role should be revoked
     */ 
    function shouldRevokeRole(
        address account,
        bytes32 role
    ) external view onlyWithReputationManager returns (bool should_revoke) {
        if (!hasRole(role, account)) {
            return false;
        }

        int256 current_reputation = reputation_manager.getGlobalReputation(
            account
        );
        int256 required_reputation = role_reputation_requirements[role];

        // Revoke if reputation falls below requirement
        should_revoke = current_reputation < required_reputation;
    }

    /**
     * @dev Revoke a role from an account if they no longer meet reputation requirements
     * @param account The account to potentially revoke the role from
     * @param role The role to potentially revoke
     */

    function checkAndRevokeRole(
        address account,
        bytes32 role
    ) external onlyWithReputationManager {
        if (!hasRole(role, account)) {
            return;
        }
        int256 current_reputation = reputation_manager.getGlobalReputation(
            account
        );
        int256 required_reputation = role_reputation_requirements[role];

        if (current_reputation < required_reputation) {
            _revokeRole(role, account);
            emit RoleRevokedDueToReputation(role, account, current_reputation);
        }
    }

    /**
     * @dev Grant a role to an account if they meet reputation requirements and don't already have it
     * @param account The account to potentially grant the role to
     * @param role The role to potentially grant
     * @return granted Whether the role was successfully granted
     */
    function checkAndGrantRole(
        address account,
        bytes32 role
    ) external onlyWithReputationManager returns (bool granted) {
        // Check if account already has the role
        if (hasRole(role, account)) {
            return false;
        }

        // Validate role type
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        int256 current_reputation = reputation_manager.getGlobalReputation(
            account
        );
        int256 required_reputation = role_reputation_requirements[role];

        if (current_reputation >= required_reputation) {
            _grantRole(role, account);
            emit RoleGrantedWithReputation(role, account, current_reputation);
            return true;
        }

        return false;
    }

    /**
     * @dev Get the reputation requirement for a specific role
     * @param role The role to query
     * @return requirement The minimum reputation required
     */
    function getRoleRequirement(
        bytes32 role
    ) external view returns (int256 requirement) {
        return role_reputation_requirements[role];
    }

    /**
     * @dev Get all role requirements
     * @return contributor_requirement Minimum reputation for contributor role
     * @return evaluator_requirement Minimum reputation for evaluator role
     * @return moderator_requirement Minimum reputation for moderator role
     */
    function getAllRoleRequirements()
        external
        view
        returns (
            int256 contributor_requirement,
            int256 evaluator_requirement,
            int256 moderator_requirement
        )
    {
        contributor_requirement = role_reputation_requirements[CONTRIBUTOR_ROLE];
        evaluator_requirement = role_reputation_requirements[EVALUATOR_ROLE];
        moderator_requirement = role_reputation_requirements[MODERATOR_ROLE];
    }

    /**
     * @dev Get user's current reputation and role eligibility
     * @param account The account to query
     * @return reputation Current global reputation
     * @return can_be_contributor Whether eligible for contributor role
     * @return can_be_evaluator Whether eligible for evaluator role
     * @return can_be_moderator Whether eligible for moderator role
     * @return is_contributor Whether currently has contributor role
     * @return is_evaluator Whether currently has evaluator role
     * @return is_moderator Whether currently has moderator role
     */ 
    function getUserStatus(
        address account
    )
        external
        view
        onlyWithReputationManager
        returns (
            int256 reputation,
            bool can_be_contributor,
            bool can_be_evaluator,
            bool can_be_moderator,
            bool is_contributor,
            bool is_evaluator,
            bool is_moderator
        )
    {
        reputation = reputation_manager.getGlobalReputation(account);

        can_be_contributor =
            reputation >= role_reputation_requirements[CONTRIBUTOR_ROLE];
        can_be_evaluator =
            reputation >= role_reputation_requirements[EVALUATOR_ROLE];
        can_be_moderator =
            reputation >= role_reputation_requirements[MODERATOR_ROLE];

        is_contributor = hasRole(CONTRIBUTOR_ROLE, account);
        is_evaluator = hasRole(EVALUATOR_ROLE, account);
        is_moderator = hasRole(MODERATOR_ROLE, account);
    }

    // ============================== ROLE CHECKING UTILITIES ==============================

    /**
     * @dev Check if an account is a contributor
     */
    function isContributor(address account) external view returns (bool) {
        return hasRole(CONTRIBUTOR_ROLE, account);
    }

    /**
     * @dev Check if an account is an evaluator
     */
    function isEvaluator(address account) external view returns (bool) {
        return hasRole(EVALUATOR_ROLE, account);
    }

    /**
     * @dev Check if an account is a moderator
     */
    function isModerator(address account) external view returns (bool) {
        return hasRole(MODERATOR_ROLE, account);
    }

    /**
     * @dev Check if an account is an admin
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }
}
