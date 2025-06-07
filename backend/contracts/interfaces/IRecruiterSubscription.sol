// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRecruiterSubscription {
    function RECRUITER_ROLE() external view returns (bytes32);

    function deposit() external payable;

    function getBudget(address recruiter) external view returns (uint256);

    function isRecruiter(address account) external view returns (bool);

    function payHiringFee(address applicant) external returns (uint256);
}
