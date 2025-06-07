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
    IReputationManager private reputationManager; // Payment history tracking
    mapping(address => bytes32[]) private recruiterPaymentHistory; // Store only record IDs
    mapping(bytes32 => PaymentRecord) private paymentRecords;

    // ========================== EVENTS ==========================
    event PaymentMade(
        bytes32 indexed recordId,
        address indexed recruiter,
        address indexed applicant,
        uint256 amount,
        uint256 timestamp
    );

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

        // Record the payment in history
        _recordPayment(msg.sender, applicant, fee);

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

    function _recordPayment(
        address recruiter,
        address applicant,
        uint256 amount
    ) internal {
        uint256 currentTimestamp = block.timestamp;
        bytes32 recordId = keccak256(
            abi.encodePacked(
                recruiter,
                applicant,
                amount,
                currentTimestamp,
                block.number
            )
        );

        PaymentRecord memory newRecord = PaymentRecord({
            timestamp: currentTimestamp,
            recruiter: recruiter,
            applicant: applicant,
            amount: amount,
            recordId: recordId
        });

        // Store only the record ID in recruiter's payment history
        recruiterPaymentHistory[recruiter].push(recordId);

        // Store the full record in global payment records mapping
        paymentRecords[recordId] = newRecord;

        emit PaymentMade(
            recordId,
            recruiter,
            applicant,
            amount,
            currentTimestamp
        );
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

    function getPaymentHistory(
        address recruiter
    ) external view returns (PaymentRecord[] memory) {
        bytes32[] memory recordIds = recruiterPaymentHistory[recruiter];
        PaymentRecord[] memory payments = new PaymentRecord[](recordIds.length);

        for (uint256 i = 0; i < recordIds.length; i++) {
            payments[i] = paymentRecords[recordIds[i]];
        }

        return payments;
    }

    function getPaymentRecord(
        bytes32 recordId
    ) external view returns (PaymentRecord memory) {
        return paymentRecords[recordId];
    }

    function getPaymentCount(
        address recruiter
    ) external view returns (uint256) {
        return recruiterPaymentHistory[recruiter].length;
    }

    function getTotalPaymentsByRecruiter(
        address recruiter
    ) external view returns (uint256) {
        bytes32[] memory recordIds = recruiterPaymentHistory[recruiter];
        uint256 total = 0;
        for (uint256 i = 0; i < recordIds.length; i++) {
            total += paymentRecords[recordIds[i]].amount;
        }
        return total;
    }
}
