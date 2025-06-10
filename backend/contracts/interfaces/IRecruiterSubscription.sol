// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRecruiterSubscription {
    struct PaymentRecord {
        uint256 timestamp;
        address recruiter;
        address applicant;
        uint256 amount;
        bytes32 recordId;
    }

    function RECRUITER_ROLE() external view returns (bytes32);

    function JOB_APPLICATION_MANAGER_ROLE() external view returns (bytes32);

    function deposit() external payable;

    function getBudget(address recruiter) external view returns (uint256);

    function isRecruiter(address account) external view returns (bool);

    function payHiringFee(
        address recruiter,
        address applicant
    ) external returns (uint256);

    function grantJobApplicationManagerRole(address account) external;

    function getPaymentHistory(address recruiter) external view returns (PaymentRecord[] memory);

    function getPaymentRecord(bytes32 recordId) external view returns (PaymentRecord memory);

    function getPaymentCount(address recruiter) external view returns (uint256);

    function getTotalPaymentsByRecruiter(address recruiter) external view returns (uint256);
}
