// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Formulas.sol";
import "./interfaces/IRecruiterSubscription.sol";
import "./interfaces/IReputationManager.sol";
import "./Constants.sol";

contract RecruiterSubscription is AccessControl, IRecruiterSubscription {
    // ========================== ROLES ==========================
    bytes32 public constant RECRUITER_ROLE = keccak256("RECRUITER_ROLE");

    // ========================== STATE VARIABLES ==========================
    mapping(address => uint256) private budgets;
    address payable public adminWallet;
    IReputationManager private reputationManager;

    // ========================== CONSTRUCTOR ==========================
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        adminWallet = payable(msg.sender);
    }

    // ========================== MAIN METHODS ==========================
    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");
        uint256 newBudget = budgets[msg.sender] + msg.value;
        _updateBudget(msg.sender, newBudget);
    }

    function payHiringFee(
        address applicant
    ) external onlyRole(RECRUITER_ROLE) returns (uint256 fee) {
        require(applicant != address(0), "Invalid applicant address");
        require(
            address(reputationManager) != address(0),
            "Reputation manager not set"
        );

        int256 reputation = reputationManager.getGlobalReputation(applicant);
        // Convert int256 to uint256, treating negative reputation as 0
        uint256 positiveReputation = reputation < 0 ? 0 : uint256(reputation);

        fee = RecruitmentFeeFormulas.calculateRecruitmentFee(
            positiveReputation
        );
        require(budgets[msg.sender] >= fee, "Insufficient budget");
        uint256 newBudget = budgets[msg.sender] - fee;
        _updateBudget(msg.sender, newBudget);
        adminWallet.transfer(fee);
    }


    // ========================== INTERNAL METHODS ==========================
    function _updateBudget(address recruiter, uint256 newBudget) internal {
        budgets[recruiter] = newBudget;
        if (newBudget >= SystemConsts.RECRUITMENT_BUDGET_MIN) {
            if (!hasRole(RECRUITER_ROLE, recruiter)) {
                _grantRole(RECRUITER_ROLE, recruiter);
            }
        } else {
            if (hasRole(RECRUITER_ROLE, recruiter)) {
                _revokeRole(RECRUITER_ROLE, recruiter);
            }
        }
    }

    // ========================== ADMIN METHODS ==========================
    function setReputationManagerAddress(
        address _reputationManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _reputationManager != address(0),
            "Invalid reputation manager address"
        );
        reputationManager = IReputationManager(_reputationManager);
    }


    // ========================== VIEW METHODS ==========================
    function isRecruiter(address account) public view returns (bool) {
        return hasRole(RECRUITER_ROLE, account);
    }

    function getBudget(address recruiter) external view returns (uint256) {
        return budgets[recruiter];
    }

    function getMinimumBudget() external pure returns (uint256) {
        return SystemConsts.RECRUITMENT_BUDGET_MIN;
    }
}
