// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Formulas.sol";
import "./Constants.sol";
import "./interfaces/IChallengeManager.sol";
import "./interfaces/IModerationEscrow.sol";

contract ChallengeCostManager is AccessControl {
    // ========================== ROLE CONSTANTS ==========================
    bytes32 public constant CHALLENGE_MANAGER_ROLE =
        keccak256("CHALLENGE_MANAGER_ROLE");

    // ========================== STRUCTS ==========================
    struct ChallengeRevenue {
        uint256 total_revenue;
        mapping(address => uint256) talent_payments;
        address[] talents; // To keep track of unique talents
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
    }

    function addTalentPayment(
        uint256 _challenge_id,
        address _talent
    ) external payable onlyRole(CHALLENGE_MANAGER_ROLE) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_talent != address(0), "Invalid talent address");
        require(
            address(challenge_manager) != address(0),
            "ChallengeManager not set"
        );
        require(
            challenge_revenues[_challenge_id].talent_payments[_talent] == 0,
            "Talent has already been paid for this challenge"
        );

        // Get the contributor of the challenge
        address contributor = challenge_manager.getChallengeContributorById(
            _challenge_id
        );

        // Send the payment to the contributor (before state changes)
        (bool success, ) = payable(contributor).call{value: msg.value}("");
        require(success, "Transfer to contributor failed");

        // Update talent's payment for this challenge
        challenge_revenues[_challenge_id].talent_payments[_talent] = msg.value;

        // Update total revenue for this challenge
        challenge_revenues[_challenge_id].total_revenue += msg.value;

        // Add talent to the list
        challenge_revenues[_challenge_id].talents.push(_talent);

        emit TalentPaymentAdded(_challenge_id, _talent, msg.value);
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

    // ========================== ROLE MANAGEMENT ==========================
    /**
     * @notice Grant the CHALLENGE_MANAGER_ROLE to an account
     * @param account The account to grant the role to
     */
    function grantChallengeManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CHALLENGE_MANAGER_ROLE, account);
    }

    /**
     * @notice Revoke the CHALLENGE_MANAGER_ROLE from an account
     * @param account The account to revoke the role from
     */
    function revokeChallengeManagerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(CHALLENGE_MANAGER_ROLE, account);
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

    function getTalents(
        uint256 _challenge_id
    ) external view returns (address[] memory) {
        return challenge_revenues[_challenge_id].talents;
    }
}
