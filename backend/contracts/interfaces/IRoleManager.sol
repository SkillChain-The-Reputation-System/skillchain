// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IRoleManager
 * @dev Interface for the RoleManager contract
 * @dev Provides role-based access control with reputation requirements
 */
interface IRoleManager {
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

    // ============================== ERRORS ==============================
    error InsufficientReputationScore(
        address account,
        int256 current_reputation,
        int256 required_reputation
    );
    error InvalidReputationManager();
    error InvalidRole();
    error ReputationManagerNotSet();

    // ============================== ROLE CONSTANTS ==============================
    function CONTRIBUTOR_ROLE() external view returns (bytes32);

    function EVALUATOR_ROLE() external view returns (bytes32);

    function MODERATOR_ROLE() external view returns (bytes32);

    // ============================== ADMIN FUNCTIONS ==============================
    /**
     * @dev Set the ReputationManager contract address
     * @param _reputation_manager Address of the ReputationManager contract
     */
    function setReputationManagerAddress(address _reputation_manager) external;

    /**
     * @dev Update reputation requirement for a specific role
     * @param role The role to update
     * @param _new_requirement The new minimum reputation requirement
     */
    function updateRoleRequirement(
        bytes32 role,
        int256 _new_requirement
    ) external;

    /**
     * @dev Emergency function to grant role without reputation check
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function emergencyGrantRole(bytes32 role, address account) external;

    // ============================== PUBLIC FUNCTIONS ==============================
    /**
     * @dev Request a role based on current reputation
     * @param role The role to request
     */
    function requestRole(bytes32 role) external;

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
        returns (
            bool can_grant,
            int256 current_reputation,
            int256 required_reputation
        );

    /**
     * @dev Check if a user should lose a role due to reputation decline
     * @param account The account to check
     * @param role The role to check
     * @return should_revoke Whether the role should be revoked
     */
    function shouldRevokeRole(
        address account,
        bytes32 role
    ) external view returns (bool should_revoke);

    /**
     * @dev Revoke a role from an account if they no longer meet reputation requirements
     * @param account The account to potentially revoke the role from
     * @param role The role to potentially revoke
     */
    function checkAndRevokeRole(address account, bytes32 role) external;

    /**
     * @dev Get the reputation requirement for a specific role
     * @param role The role to query
     * @return requirement The minimum reputation required
     */
    function getRoleRequirement(
        bytes32 role
    ) external view returns (int256 requirement);

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
        returns (
            int256 reputation,
            bool can_be_contributor,
            bool can_be_evaluator,
            bool can_be_moderator,
            bool is_contributor,
            bool is_evaluator,
            bool is_moderator
        );

    // ============================== ROLE CHECKING UTILITIES ==============================
    /**
     * @dev Check if an account has a specific role
     * @param role The role to check
     * @param account The account to check
     * @return Whether the account has the role
     */
    function hasRole(
        bytes32 role,
        address account
    ) external view returns (bool);

    /**
     * @dev Check if an account is a contributor
     * @param account The account to check
     * @return Whether the account is a contributor
     */
    function isContributor(address account) external view returns (bool);

    /**
     * @dev Check if an account is an evaluator
     * @param account The account to check
     * @return Whether the account is an evaluator
     */
    function isEvaluator(address account) external view returns (bool);

    /**
     * @dev Check if an account is a moderator
     * @param account The account to check
     * @return Whether the account is a moderator
     */
    function isModerator(address account) external view returns (bool);

    /**
     * @dev Check if an account is an admin
     * @param account The account to check
     * @return Whether the account is an admin
     */
    function isAdmin(address account) external view returns (bool);
}
