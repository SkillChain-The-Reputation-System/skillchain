// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Constants.sol";

contract JobManager {
    // ========================= STRUCTS =========================
    struct Job {
        bytes32 id; // ID of the job: = keccak256(abi.encodePacked(msg.sender, block.timestamp))
        address recruiter;
        string content_url;
        uint256 created_at;
        SystemEnums.JobStatus status;
    }

    // ========================= STATE VARIABLES =========================
    // Mapping to store job postings: job ID => Job struct
    mapping(bytes32 => Job) private jobs;

    // Mapping to store job IDs by recruiter: recruiter address => array of job IDs
    mapping(address => bytes32[]) private recruiter_jobs;

    // Mapping to store job IDs by status: JobStatus => array of job IDs
    mapping(SystemEnums.JobStatus => bytes32[]) private status_jobs;

    // Array to track all job IDs for enumeration
    bytes32[] private all_job_ids;

    // ========================= EVENTS =========================
    event JobCreated(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobPublished(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobClosed(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobFilled(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobPaused(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobResumed(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobArchived(
        bytes32 indexed id,
        address indexed recruiter,
        string content_url
    );

    // ========================= MODIFIERS =========================
    modifier onlyRecruiter(bytes32 id) {
        require(
            jobs[id].recruiter == msg.sender,
            "You are not the owner of this job posting"
        );
        _;
    }

    modifier onlyInDraft(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.DRAFT,
            "Job is not in DRAFT status"
        );
        _;
    }

    modifier onlyInOpen(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.OPEN,
            "Job is not in OPEN status"
        );
        _;
    }

    modifier onlyInPaused(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.PAUSED,
            "Job is not in PAUSED status"
        );
        _;
    }

    modifier onlyInClosed(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.CLOSED,
            "Job is not in CLOSED status"
        );
        _;
    }

    modifier onlyInFilled(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.FILLED,
            "Job is not in FILLED status"
        );
        _;
    }

    modifier onlyInArchived(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.ARCHIVED,
            "Job is not in ARCHIVED status"
        );
        _;
    }

    modifier onlyInOpenOrPausedOrFilled(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.OPEN ||
                jobs[id].status == SystemEnums.JobStatus.PAUSED ||
                jobs[id].status == SystemEnums.JobStatus.FILLED,
            "Job is not in OPEN, PAUSED or FILLED status"
        );
        _;
    }

    modifier onlyInClosedOrDraft(bytes32 id) {
        require(
            jobs[id].status == SystemEnums.JobStatus.CLOSED ||
                jobs[id].status == SystemEnums.JobStatus.DRAFT,
            "Job is not in CLOSED or DRAFT status"
        );
        _;
    }

    // ========================= JOB MANAGEMENT =========================
    /// @notice Create a job posting
    /// @param content_url URL pointing to job details stored off-chain (IPFS/Arweave CID)
    /// @return id The new job's unique ID
    function createJob(
        string calldata content_url
    ) external returns (bytes32 id) {
        console.log("Creating job with content URL:", content_url);
        // Validate input
        require(bytes(content_url).length > 0, "Content URL cannot be empty");

        // Generate a unique bytes32 ID based on sender and timestamp
        id = keccak256(abi.encodePacked(msg.sender, block.timestamp));

        // Store job data
        jobs[id] = Job({
            id: id,
            recruiter: msg.sender,
            content_url: content_url,
            status: SystemEnums.JobStatus.DRAFT,
            created_at: block.timestamp * 1000 // Convert to milliseconds
        });

        // Add to tracking arrays for enumeration
        all_job_ids.push(id);
        recruiter_jobs[msg.sender].push(id);
        status_jobs[SystemEnums.JobStatus.DRAFT].push(id);

        emit JobCreated(id, msg.sender, content_url);
    }

    /// @notice Publish a job posting
    /// @param id The job ID to publish
    function publishJob(bytes32 id) external onlyRecruiter(id) onlyInDraft(id) {
        Job storage job = jobs[id];

        // Remove job from DRAFT status array
        _removeJobFromStatus(id, SystemEnums.JobStatus.DRAFT);

        // Update job status
        job.status = SystemEnums.JobStatus.OPEN;

        // Add job to OPEN status array
        status_jobs[SystemEnums.JobStatus.OPEN].push(id);

        emit JobPublished(id, msg.sender, job.content_url);
    }

    /// @notice Pause a job posting
    /// @param id The job ID to pause
    function pauseJob(bytes32 id) external onlyRecruiter(id) onlyInOpen(id) {
        Job storage job = jobs[id];

        // Remove job from OPEN status array
        _removeJobFromStatus(id, SystemEnums.JobStatus.OPEN);

        // Update job status
        job.status = SystemEnums.JobStatus.PAUSED;

        // Add job to PAUSED status array
        status_jobs[SystemEnums.JobStatus.PAUSED].push(id);

        emit JobPaused(id, msg.sender, job.content_url);
    }

    /// @notice Resume a paused job posting
    /// @param id The job ID to resume
    function resumeJob(bytes32 id) external onlyRecruiter(id) onlyInPaused(id) {
        Job storage job = jobs[id];

        // Remove job from PAUSED status array
        _removeJobFromStatus(id, SystemEnums.JobStatus.PAUSED);

        // Update job status
        job.status = SystemEnums.JobStatus.OPEN;

        // Add job to OPEN status array
        status_jobs[SystemEnums.JobStatus.OPEN].push(id);

        emit JobResumed(id, msg.sender, job.content_url);
    }

    /// @notice Close a job posting
    /// @param id The job ID to close
    function closeJob(
        bytes32 id
    ) external onlyRecruiter(id) onlyInOpenOrPausedOrFilled(id) {
        Job storage job = jobs[id];

        // Remove job from its current status array
        _removeJobFromStatus(id, job.status);

        // Update job status
        job.status = SystemEnums.JobStatus.CLOSED;

        // Add job to CLOSED status array
        status_jobs[SystemEnums.JobStatus.CLOSED].push(id);

        emit JobClosed(id, msg.sender, job.content_url);
    }

    /// @notice Archive a job posting
    /// @param id The job ID to archive
    function archiveJob(
        bytes32 id
    ) external onlyRecruiter(id) onlyInClosedOrDraft(id) {
        Job storage job = jobs[id];

        // Remove job from its current status array
        _removeJobFromStatus(id, job.status);

        // Update job status
        job.status = SystemEnums.JobStatus.ARCHIVED;

        // Add job to ARCHIVED status array
        status_jobs[SystemEnums.JobStatus.ARCHIVED].push(id);

        emit JobArchived(id, msg.sender, job.content_url);
    }

    /// @notice Mark a job as filled
    /// @param id The job ID to mark as filled
    function fillJob(bytes32 id) external onlyRecruiter(id) onlyInOpen(id) {
        Job storage job = jobs[id];

        // Remove job from OPEN status array
        _removeJobFromStatus(id, SystemEnums.JobStatus.OPEN);

        // Update job status
        job.status = SystemEnums.JobStatus.FILLED;

        // Add job to FILLED status array
        status_jobs[SystemEnums.JobStatus.FILLED].push(id);

        emit JobFilled(id, msg.sender, job.content_url);
    }

    // ========================= VIEW FUNCTIONS =========================
    /// @notice Fetch a single job
    /// @param id The job ID to fetch
    /// @return The job details
    function getJob(bytes32 id) external view returns (Job memory) {
        return jobs[id];
    }

    /// @notice Fetch all opened jobs
    /// @return An array of all opened jobs
    function getAllOpenJobs() external view returns (Job[] memory) {
        bytes32[] memory open_job_ids = status_jobs[SystemEnums.JobStatus.OPEN];
        Job[] memory open_jobs = new Job[](open_job_ids.length);

        for (uint256 i = 0; i < open_job_ids.length; i++) {
            open_jobs[i] = jobs[open_job_ids[i]];
        }

        return open_jobs;
    }

    /// @notice Get all jobs posted by a specific recruiter
    /// @param recruiter The address of the recruiter
    /// @return An array of jobs posted by the recruiter
    function getJobsByRecruiter(
        address recruiter
    ) external view returns (Job[] memory) {
        bytes32[] memory job_ids = recruiter_jobs[recruiter];
        Job[] memory recruiter_jobs_arr = new Job[](job_ids.length);

        for (uint256 i = 0; i < job_ids.length; i++) {
            recruiter_jobs_arr[i] = jobs[job_ids[i]];
        }

        return recruiter_jobs_arr;
    }

    /// @notice Get all jobs with a specific status
    /// @param status The status to filter by
    /// @return An array of jobs with the specified status
    function getJobsByStatus(
        SystemEnums.JobStatus status
    ) external view returns (Job[] memory) {
        bytes32[] memory job_ids = status_jobs[status];
        Job[] memory status_jobs_arr = new Job[](job_ids.length);

        for (uint256 i = 0; i < job_ids.length; i++) {
            status_jobs_arr[i] = jobs[job_ids[i]];
        }

        return status_jobs_arr;
    }

    // ========================= HELPER FUNCTIONS =========================
    /// @notice Helper function to remove a job from its status array
    /// @param id The job ID to remove
    /// @param status The status array to remove from
    function _removeJobFromStatus(
        bytes32 id,
        SystemEnums.JobStatus status
    ) private {
        bytes32[] storage status_array = status_jobs[status];
        for (uint256 i = 0; i < status_array.length; i++) {
            if (status_array[i] == id) {
                // Replace the element to remove with the last element
                status_array[i] = status_array[status_array.length - 1];
                // Remove the last element
                status_array.pop();
                break;
            }
        }
    }
}
