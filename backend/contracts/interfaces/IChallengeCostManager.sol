// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IChallengeCostManager {
    event TalentPaymentAdded(
        uint256 indexed challenge_id,
        address indexed talent,
        uint256 amount
    );

    function getCost(uint256 challengeId) external view returns (uint256);

    function addTalentPayment(uint256 challengeId) external payable;

    function setChallengeManagerAddress(address _address) external;

    function setModerationEscrowAddress(address _address) external;

    function getTalentPayment(
        uint256 challengeId,
        address talent
    ) external view returns (uint256);

    function getTotalRevenue(
        uint256 challengeId
    ) external view returns (uint256);
}
