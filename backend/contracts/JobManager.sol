// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Constants.sol";

contract JobManager {
    // ========================= STRUCTS =========================
    struct Job {
        uint256 id;
        address recruiter;
        string content_url;
        uint256 created_at;
        SystemEnums.JobStatus status;
    }

    // ========================= STATE VARIABLES =========================
    uint256 public job_count;
    mapping(uint256 => Job) public jobs;

    // ========================= EVENTS =========================
    event DraftJobCreated(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobPublished(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobClosed(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );
    
    event JobFilled(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobPaused(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );

    event JobArchived(
        uint256 indexed id,
        address indexed recruiter,
        string content_url
    );

    // ========================= JOB MANAGEMENT =========================
    /// @notice Create a draft job posting
    /// @param content_url URL pointing to job details stored off-chain (IPFS/Arweave CID)
    /// @return id The new job's unique ID
    function createDraftJob(
        string calldata content_url
    ) external returns (uint256 id) {
        job_count++;
        id = job_count;
        jobs[id] = Job({
            id: id,
            recruiter: msg.sender,
            content_url: content_url,
            status: SystemEnums.JobStatus.DRAFT,
            created_at: block.timestamp * 1000
        });
        emit DraftJobCreated(id, msg.sender, content_url);
    }

    function updateJob(uint256 id, string calldata content_url) external {
        Job storage job = jobs[id];
        require(
            job.recruiter == msg.sender,
            "You are not the owner of this job posting"
        );
        job.content_url = content_url;
    }

    /// @notice Publish a job posting
    /// @param id The job ID to publish
    function publishJob(uint256 id) external {
        Job storage job = jobs[id];
        require(
            job.recruiter == msg.sender,
            "You are not the owner of this job posting"
        );
        require(
            job.status == SystemEnums.JobStatus.DRAFT,
            "Cannot publish a job that is not in DRAFT status"
        );
        job.status = SystemEnums.JobStatus.OPEN;
        emit JobPublished(id, msg.sender, job.content_url);
    }

    /// @notice Close a job posting
    /// @param id The job ID to close
    function closeJob(uint256 id) external {
        Job storage job = jobs[id];
        require(
            job.recruiter == msg.sender,
            "You are not the owner of this job posting"
        );
        job.status = SystemEnums.JobStatus.CLOSED;
    }

    /// @notice Archive a job posting
    /// @param id The job ID to archive
    function archiveJob(uint256 id) external {
        Job storage job = jobs[id];
        require(
            job.recruiter == msg.sender,
            "You are not the owner of this job posting"
        );
        job.status = SystemEnums.JobStatus.ARCHIVED;
    }

    // ========================= VIEW FUNCTIONS =========================
    /// @notice Fetch a single job
    function getJob(uint256 id) external view returns (Job memory) {
        return jobs[id];
    }

    /// @notice List all active job IDs
    function listActiveJobs() external view returns (uint256[] memory) {
        uint256 activeCount;
        // First pass: count actives
        for (uint256 i = 1; i <= job_count; i++) {
            if (jobs[i].status == SystemEnums.JobStatus.OPEN) activeCount++;
        }

        uint256[] memory ids = new uint256[](activeCount);
        uint256 idx;
        // Second pass: collect actives
        for (uint256 i = 1; i <= job_count; i++) {
            if (jobs[i].status == SystemEnums.JobStatus.OPEN) {
                ids[idx++] = i;
            }
        }
        return ids;
    }
}
