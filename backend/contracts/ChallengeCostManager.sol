// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Formulas.sol";
import "./Constants.sol";
import "./interfaces/IChallengeManager.sol";
import "./interfaces/IModerationEscrow.sol";

contract ChallengeCostManager is AccessControl {
    // ========================== STRUCTS ==========================
    struct ChallengeRevenue {
        uint256 total_revenue;
        mapping(address => uint256) talent_payments;
    }

    // ========================== EVENTS ==========================
    event TalentPaymentAdded(
        uint256 indexed challenge_id,
        address indexed talent,
        uint256 amount
    );

    // ========================== STATE VARIABLES ==========================
    mapping(uint256 => ChallengeRevenue) private challenge_revenues;

    IChallengeManager private challenge_manager;
    IModerationEscrow private moderation_escrow;
    address private challenge_manager_address;
    address private moderation_escrow_address;

    // ========================== CONSTRUCTORS ==========================

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ========================== MAIN METHODS ==========================
    function _computeCost(
        uint256 _challenge_id
    ) internal view returns (uint256) {
        require(
            address(challenge_manager) != address(0),
            "ChallengeManager not set"
        );
        require(
            address(moderation_escrow) != address(0),
            "ModerationEscrow not set"
        );

        // Get difficulty from challenge_id
        SystemEnums.DifficultyLevel difficulty = challenge_manager
            .getChallengeDifficultyById(_challenge_id);
        uint256 weight = Weights.getDifficultyCostWeight(difficulty);

        // Get bounty from challenge_id via ModerationEscrow
        uint256 bounty = moderation_escrow.getBounty(_challenge_id);
        // Get quality score from challenge_id
        uint256 quality_score = challenge_manager.getChallengeQualityScoreById(
            _challenge_id
        );
        // Get the current number of participants who joined the challenge
        address[] memory participants = challenge_manager
            .getChallengeParticipants(_challenge_id);
        uint256 participant_count = participants.length;
        uint256 cost = ChallengeCostFormulas.calculateCost(
            weight,
            quality_score,
            bounty,
            participant_count
        );
        return cost;
    }    function addTalentPayment(uint256 _challenge_id) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(
            address(challenge_manager) != address(0),
            "ChallengeManager not set"
        );

        // Get the contributor of the challenge
        address contributor = challenge_manager.getChallengeContributorById(_challenge_id);

        // Send the payment to the contributor (before state changes)
        (bool success, ) = payable(contributor).call{value: msg.value}("");
        require(success, "Transfer to contributor failed");

        // Update talent's payment for this challenge
        challenge_revenues[_challenge_id].talent_payments[msg.sender] += msg
            .value;

        // Update total revenue for this challenge
        challenge_revenues[_challenge_id].total_revenue += msg.value;

        emit TalentPaymentAdded(_challenge_id, msg.sender, msg.value);
    }

    // ========================== ADMIN METHODS ==========================
    function setChallengeManagerAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid ChallengeManager address");
        challenge_manager_address = _address;
        challenge_manager = IChallengeManager(_address);
    }

    function setModerationEscrowAddress(
        address _address
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_address != address(0), "Invalid ModerationEscrow address");
        moderation_escrow_address = _address;
        moderation_escrow = IModerationEscrow(_address);
    }

    // ========================== VIEW METHODS ==========================
    function getCost(uint256 _challenge_id) external view returns (uint256) {
        return _computeCost(_challenge_id);
    }

    function getTalentPayment(
        uint256 _challenge_id,
        address _talent
    ) external view returns (uint256) {
        return challenge_revenues[_challenge_id].talent_payments[_talent];
    }

    function getTotalRevenue(
        uint256 _challenge_id
    ) external view returns (uint256) {
        return challenge_revenues[_challenge_id].total_revenue;
    }
}
