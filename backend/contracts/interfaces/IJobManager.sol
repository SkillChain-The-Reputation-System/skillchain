// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../Constants.sol";

/**
 * @title IJobManager
 * @dev Interface for the JobManager contract
 * @notice Defines the structure and functions for managing job postings in the system
 */
interface IJobManager {
    // ============ Structs ============

    /**
     * @dev Represents a job posting in the system
     */
    struct Job {
        bytes32 id; // ID of the job: = keccak256(abi.encodePacked(msg.sender, block.timestamp))
        address recruiter;
        string content_id;
        uint256 created_at;
        SystemEnums.JobStatus status;
    }

    // ============ Events ============

    /**
     * @dev Emitted when a new job is created
     */
    event JobCreated(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is published
     */
    event JobPublished(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is closed
     */
    event JobClosed(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is filled
     */
    event JobFilled(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is paused
     */
    event JobPaused(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is resumed
     */
    event JobResumed(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    /**
     * @dev Emitted when a job is archived
     */
    event JobArchived(
        bytes32 indexed id,
        address indexed recruiter,
        string content_id
    );

    // ============ Job Management Functions ============

    /**
     * @notice Create a job posting
     * @param content_id URL pointing to job details stored off-chain (Irys)
     * @return id The new job's unique ID
     */
    function createJob(
        string calldata content_id
    ) external returns (bytes32 id);

    /**
     * @notice Publish a job posting
     * @param id The job ID to publish
     */
    function publishJob(bytes32 id) external;

    /**
     * @notice Pause a job posting
     * @param id The job ID to pause
     */
    function pauseJob(bytes32 id) external;

    /**
     * @notice Resume a paused job posting
     * @param id The job ID to resume
     */
    function resumeJob(bytes32 id) external;

    /**
     * @notice Close a job posting
     * @param id The job ID to close
     */
    function closeJob(bytes32 id) external;

    /**
     * @notice Archive a job posting
     * @param id The job ID to archive
     */
    function archiveJob(bytes32 id) external;

    /**
     * @notice Mark a job as filled
     * @param id The job ID to mark as filled
     */
    function fillJob(bytes32 id) external;

    // ============ View Functions ============

    /**
     * @notice Fetch a single job
     * @param id The job ID to fetch
     * @return The job details
     */
    function getJob(bytes32 id) external view returns (Job memory);

    /**
     * @notice Fetch all opened jobs
     * @return An array of all opened jobs
     */
    function getAllOpenJobs() external view returns (Job[] memory);

    /**
     * @notice Get all jobs posted by a specific recruiter
     * @param recruiter The address of the recruiter
     * @return An array of jobs posted by the recruiter
     */
    function getJobsByRecruiter(
        address recruiter
    ) external view returns (Job[] memory);

    /**
     * @notice Get all jobs with a specific status
     * @param status The status to filter by
     * @return An array of jobs with the specified status
     */
    function getJobsByStatus(
        SystemEnums.JobStatus status
    ) external view returns (Job[] memory);

    /**
     * @notice Get the content ID of a specific job
     * @param id The job ID to get the content ID for
     * @return The content ID of the job (URL pointing to off-chain storage)
     */
    function getJobContentID(bytes32 id) external view returns (string memory);

    /**
     * @notice Get possible next statuses a job can transition to from current status
     * @param status The current job status
     * @return An array of possible status transitions
     */
    function getPossibleStatusTransitions(
        SystemEnums.JobStatus status
    ) external pure returns (SystemEnums.JobStatus[] memory);
}
