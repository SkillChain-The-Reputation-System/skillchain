// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IChallengeCostManager {
    event TalentPaymentAdded(
        bytes32 indexed challenge_id,
        address indexed talent,
        uint256 amount
    );    
    
    function getCost(bytes32 challengeId) external view returns (uint256);
    
    function addTalentPayment(bytes32 challengeId, address talent) external payable;

    function setChallengeManagerAddress(address _address) external;

    function setModerationEscrowAddress(address _address) external;

    function getTalentPayment(
        bytes32 challengeId,
        address talent
    ) external view returns (uint256);

    function getTotalRevenue(
        bytes32 challengeId
    ) external view returns (uint256);
}
