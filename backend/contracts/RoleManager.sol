// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IReputationManager.sol";
import "./Constants.sol";

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

    // Minimum domain reputation requirements for each role
    mapping(bytes32 => mapping(SystemEnums.Domain => int256))
        public role_domain_reputation_requirements;

    // ============================== EVENTS ==============================
    event RoleRequirementUpdated(
        bytes32 indexed role,
        int256 oldRequirement,
        int256 newRequirement
    );
    event DomainRoleRequirementUpdated(
        bytes32 indexed role,
        SystemEnums.Domain indexed domain,
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
    event DomainRoleGranted(
        bytes32 indexed role,
        SystemEnums.Domain indexed domain,
        address indexed account,
        int256 reputation
    );
    event RoleRevokedDueToReputation(
        bytes32 indexed role,
        address indexed account,
        int256 reputation
    );

    // ============================== INTERNAL UTILITIES ======================
    function getDomainRole(
        bytes32 role,
        SystemEnums.Domain domain
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(role, domain));
    }

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
        // Set initial domain reputation requirements for all domains
        for (uint256 i = 0; i < SystemConsts.N_DOMAIN; i++) {
            SystemEnums.Domain domain = SystemEnums.Domain(i);
            role_domain_reputation_requirements[CONTRIBUTOR_ROLE][domain] = 50;
            role_domain_reputation_requirements[EVALUATOR_ROLE][domain] = 100;
            role_domain_reputation_requirements[MODERATOR_ROLE][domain] = 200;
        }

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
        SystemEnums.Domain domain,
        int256 _new_requirement
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        int256 old_requirement = role_domain_reputation_requirements[role][
            domain
        ];
        role_domain_reputation_requirements[role][domain] = _new_requirement;

        emit DomainRoleRequirementUpdated(
            role,
            domain,
            old_requirement,
            _new_requirement
        );
    }

    /**
     * @dev Emergency function to grant role without reputation check
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function emergencyGrantRole(
        bytes32 role,
        SystemEnums.Domain domain,
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        bytes32 domainRole = getDomainRole(role, domain);
        _grantRole(domainRole, account);
    }

    // ============================== PUBLIC FUNCTIONS ==============================

    /**
     * @dev Request a role based on current reputation
     * @param role The role to request
     */
    
    function requestRole(
        bytes32 role,
        SystemEnums.Domain domain
    ) external onlyWithReputationManager {
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );
        int256 current_reputation = reputation_manager.getDomainReputation(
            msg.sender,
            domain
        );
        int256 required_reputation = role_domain_reputation_requirements[role][
            domain
        ];

        require(
            current_reputation >= required_reputation,
            "Insufficient reputation score"
        );

        bytes32 domainRole = getDomainRole(role, domain);
        _grantRole(domainRole, msg.sender);

        emit DomainRoleGranted(role, domain, msg.sender, current_reputation);
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
        SystemEnums.Domain domain,
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
        current_reputation = reputation_manager.getDomainReputation(
            account,
            domain
        );
        required_reputation = role_domain_reputation_requirements[role][domain];
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
        bytes32 role,
        SystemEnums.Domain domain
    ) external view onlyWithReputationManager returns (bool should_revoke) {
        bytes32 domainRole = getDomainRole(role, domain);
        if (!hasRole(domainRole, account)) {
            return false;
        }

        int256 current_reputation = reputation_manager.getDomainReputation(
            account,
            domain
        );
        int256 required_reputation = role_domain_reputation_requirements[role][
            domain
        ];

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
        bytes32 role,
        SystemEnums.Domain domain
    ) external onlyWithReputationManager {
        bytes32 domainRole = getDomainRole(role, domain);
        if (!hasRole(domainRole, account)) {
            return;
        }
        int256 current_reputation = reputation_manager.getDomainReputation(
            account,
            domain
        );
        int256 required_reputation = role_domain_reputation_requirements[role][
            domain
        ];

        if (current_reputation < required_reputation) {
            _revokeRole(domainRole, account);
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
        bytes32 role,
        SystemEnums.Domain domain
    ) external onlyWithReputationManager returns (bool granted) {
        bytes32 domainRole = getDomainRole(role, domain);
        // Check if account already has the role for domain
        if (hasRole(domainRole, account)) {
            return false;
        }

        // Validate role type
        require(
            role == CONTRIBUTOR_ROLE ||
                role == EVALUATOR_ROLE ||
                role == MODERATOR_ROLE,
            "Invalid role"
        );

        int256 current_reputation = reputation_manager.getDomainReputation(
            account,
            domain
        );
        int256 required_reputation = role_domain_reputation_requirements[role][
            domain
        ];

        if (current_reputation >= required_reputation) {
            _grantRole(domainRole, account);
            emit DomainRoleGranted(role, domain, account, current_reputation);
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
        bytes32 role,
        SystemEnums.Domain domain
    ) external view returns (int256 requirement) {
        return role_domain_reputation_requirements[role][domain];
    }

    /**
     * @dev Get all role requirements
     * @return contributor_requirement Minimum reputation for contributor role
     * @return evaluator_requirement Minimum reputation for evaluator role
     * @return moderator_requirement Minimum reputation for moderator role
     */
    function getAllRoleRequirements(SystemEnums.Domain domain)
        external
        view
        returns (
            int256 contributor_requirement,
            int256 evaluator_requirement,
            int256 moderator_requirement
        )
    {
        contributor_requirement =
            role_domain_reputation_requirements[CONTRIBUTOR_ROLE][domain];
        evaluator_requirement =
            role_domain_reputation_requirements[EVALUATOR_ROLE][domain];
        moderator_requirement =
            role_domain_reputation_requirements[MODERATOR_ROLE][domain];
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
    function getUserDomainStatus(
        address account,
        SystemEnums.Domain domain
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
        reputation = reputation_manager.getDomainReputation(account, domain);

        can_be_contributor =
            reputation >=
            role_domain_reputation_requirements[CONTRIBUTOR_ROLE][domain];
        can_be_evaluator =
            reputation >=
            role_domain_reputation_requirements[EVALUATOR_ROLE][domain];
        can_be_moderator =
            reputation >=
            role_domain_reputation_requirements[MODERATOR_ROLE][domain];

        bytes32 cRole = getDomainRole(CONTRIBUTOR_ROLE, domain);
        bytes32 eRole = getDomainRole(EVALUATOR_ROLE, domain);
        bytes32 mRole = getDomainRole(MODERATOR_ROLE, domain);

        is_contributor = hasRole(cRole, account);
        is_evaluator = hasRole(eRole, account);
        is_moderator = hasRole(mRole, account);
    }

    // ============================== ROLE CHECKING UTILITIES ==============================

    /**
     * @dev Check if an account is a contributor
     */
    function isContributor(
        address account,
        SystemEnums.Domain domain
    ) external view returns (bool) {
        return hasRole(getDomainRole(CONTRIBUTOR_ROLE, domain), account);
    }

    /**
     * @dev Check if an account is an evaluator
     */
    function isEvaluator(
        address account,
        SystemEnums.Domain domain
    ) external view returns (bool) {
        return hasRole(getDomainRole(EVALUATOR_ROLE, domain), account);
    }

    /**
     * @dev Check if an account is a moderator
     */
    function isModerator(
        address account,
        SystemEnums.Domain domain
    ) external view returns (bool) {
        return hasRole(getDomainRole(MODERATOR_ROLE, domain), account);
    }

    /**
     * @dev Check if an account is an admin
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }
}
