// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Constants.sol";
import "./interfaces/IJobManager.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRecruiterSubscription.sol";

contract JobApplicationManager is AccessControl {
    // ========================= STRUCTS =========================
    struct Application {
        bytes32 id; // Unique application ID
        bytes32 job_id; // The job being applied for
        address applicant; // Address of the talent applying
        uint256 applied_at; // Timestamp of application
        SystemEnums.ApplicationStatus status; // Current application status
    }

    // ========================= STATE VARIABLES =========================
    // Reference to JobManager contract
    IJobManager private job_manager;

    // Reference to RecruiterSubscription contract
    IRecruiterSubscription private recruiter_subscription;

    // Mapping to store applications: application ID => Application struct
    mapping(bytes32 => Application) private applications;

    // Mapping to track applications by job: job ID => array of application IDs
    mapping(bytes32 => bytes32[]) private job_applications;

    // Mapping to track applications by applicant: applicant address => array of application IDs
    mapping(address => bytes32[]) private applicant_applications;

    // Mapping to track applications by status: status => array of application IDs
    mapping(SystemEnums.ApplicationStatus => bytes32[])
        private status_applications;

    // ========================= EVENTS =========================
    event ApplicationSubmitted(
        bytes32 indexed applicationId,
        bytes32 indexed jobId,
        address indexed applicant
    );

    event ApplicationStatusChanged(
        bytes32 indexed applicationId,
        SystemEnums.ApplicationStatus previousStatus,
        SystemEnums.ApplicationStatus newStatus
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ========================= MODIFIERS =========================

    modifier onlyOpenJob(bytes32 job_id) {
        IJobManager.Job memory job = job_manager.getJob(job_id);
        require(
            job.status == SystemEnums.JobStatus.OPEN,
            "Job is not open for applications"
        );
        _;
    }

    modifier onlyApplicant(bytes32 application_id) {
        require(
            applications[application_id].applicant == msg.sender,
            "Not the application owner"
        );
        _;
    }

    modifier onlySubscribedRecruiter() {
        require(
            address(recruiter_subscription) != address(0) &&
                recruiter_subscription.isRecruiter(msg.sender),
            "Recruiter has insufficient budget"
        );
        _;
    }

    // ========================= APPLICATION FUNCTIONS =========================

    /// @notice Submit an application for a job
    /// @param job_id The ID of the job being applied for
    /// @return application_id The unique ID of the created application
    function submitApplication(
        bytes32 job_id
    ) external onlyOpenJob(job_id) returns (bytes32 application_id) {
        // Get the job to check if the sender is the recruiter
        IJobManager.Job memory job = job_manager.getJob(job_id);
        require(
            job.recruiter != msg.sender,
            "Recruiters cannot apply to their own jobs"
        );
        
        // Check if applicant has already applied for this job
        bytes32[] memory applicant_apps = applicant_applications[msg.sender];
        for (uint i = 0; i < applicant_apps.length; i++) {
            Application memory app = applications[applicant_apps[i]];
            if (app.job_id == job_id) {
                revert("Already applied to this job");
            }
        }

        // Generate unique application ID
        application_id = keccak256(
            abi.encodePacked(msg.sender, job_id, block.timestamp)
        );

        // Create application
        Application memory new_application = Application({
            id: application_id,
            job_id: job_id,
            applicant: msg.sender,
            applied_at: block.timestamp * 1000, // Convert to milliseconds
            status: SystemEnums.ApplicationStatus.PENDING
        });

        // Store application
        applications[application_id] = new_application;

        // Update mappings
        job_applications[job_id].push(application_id);
        applicant_applications[msg.sender].push(application_id);
        status_applications[SystemEnums.ApplicationStatus.PENDING].push(
            application_id
        );

        emit ApplicationSubmitted(application_id, job_id, msg.sender);

        return application_id;
    }

    /// @notice Update the status of an application
    /// @param application_id The ID of the application to update
    /// @param new_status The new status for the application
    function updateApplicationStatus(
        bytes32 application_id,
        SystemEnums.ApplicationStatus new_status
    ) external onlySubscribedRecruiter {
        Application storage application = applications[application_id];
        require(application.id == application_id, "Application does not exist");

        // Get the job to verify the caller is the recruiter
        IJobManager.Job memory job = job_manager.getJob(application.job_id);
        require(
            job.recruiter == msg.sender,
            "Only recruiter can update application status"
        );

        // Verify the status transition is valid
        require(
            isValidStatusTransition(application.status, new_status),
            "Invalid status transition"
        );

        // Store old status for event and to remove from mapping
        SystemEnums.ApplicationStatus old_status = application.status;

        // Update status
        application.status = new_status;

        // Remove from old status array
        _removeApplicationFromStatus(application_id, old_status);

        // Add to new status array
        status_applications[new_status].push(application_id);

        emit ApplicationStatusChanged(application_id, old_status, new_status);
    }

    /// @notice Withdraw an application (only by the applicant before it's processed)
    /// @param application_id The ID of the application to withdraw
    function withdrawApplication(
        bytes32 application_id
    ) external onlyApplicant(application_id) {
        Application storage application = applications[application_id];
        // Verify the status transition is valid
        require(
            isValidStatusTransition(
                application.status,
                SystemEnums.ApplicationStatus.WITHDRAWN
            ),
            "Cannot withdraw application in current state"
        );

        // Update status
        SystemEnums.ApplicationStatus old_status = application.status;
        application.status = SystemEnums.ApplicationStatus.WITHDRAWN;

        // Remove from old status array
        _removeApplicationFromStatus(application_id, old_status);

        // Add to new status array
        status_applications[SystemEnums.ApplicationStatus.WITHDRAWN].push(
            application_id
        );

        emit ApplicationStatusChanged(
            application_id,
            old_status,
            SystemEnums.ApplicationStatus.WITHDRAWN
        );
    }

    // ========================= VIEW FUNCTIONS =========================
    /// @notice Get application details
    /// @param application_id The ID of the application
    /// @return Application details
    function getApplication(
        bytes32 application_id
    ) external view returns (Application memory) {
        return applications[application_id];
    }

    
    /// @notice Get all valid statuses that an application can transition to from its current status (For RECRUITERS role!!!)
    /// @param current_status The current status of the application
    /// @return Array of valid status values that can be transitioned to
    function getValidApplicationStatusTransitions(
        SystemEnums.ApplicationStatus current_status
    ) external pure returns (SystemEnums.ApplicationStatus[] memory) {
        // Calculate the number of valid transitions for allocation
        uint256 valid_transition_count = 0;

        // Check each possible status as a destination
        for (uint i = 0; i < 7; i++) { // There are 7 statuses in the enum
            SystemEnums.ApplicationStatus potential_status = SystemEnums.ApplicationStatus(i);
            // Skip WITHDRAWN status as recruiters cannot set this status
            if (potential_status == SystemEnums.ApplicationStatus.WITHDRAWN) {
                continue;
            }
            if (isValidStatusTransition(current_status, potential_status)) {
                valid_transition_count++;
            }
        }

        // Create array with appropriate size
        SystemEnums.ApplicationStatus[] memory valid_transitions = new SystemEnums.ApplicationStatus[](valid_transition_count);

        // Populate the array with valid transitions
        uint256 index = 0;
        for (uint i = 0; i < 7; i++) {
            SystemEnums.ApplicationStatus potential_status = SystemEnums.ApplicationStatus(i);
            // Skip WITHDRAWN status as recruiters cannot set this status
            if (potential_status == SystemEnums.ApplicationStatus.WITHDRAWN) {
                continue;
            }
            if (isValidStatusTransition(current_status, potential_status)) {
                valid_transitions[index] = potential_status;
                index++;
            }
        }

        return valid_transitions;
    }

    /// @notice Get all applications for a specific job
    /// @param job_id The ID of the job
    /// @return Array of application details
    function getApplicationsByJob(
        bytes32 job_id
    ) external view returns (Application[] memory) {
        bytes32[] memory app_ids = job_applications[job_id];
        Application[] memory result = new Application[](app_ids.length);

        for (uint i = 0; i < app_ids.length; i++) {
            result[i] = applications[app_ids[i]];
        }

        return result;
    }

    /// @notice Get all applications from a specific applicant
    /// @param applicant The address of the applicant
    /// @return Array of application details
    function getApplicationsByApplicant(
        address applicant
    ) external view returns (Application[] memory) {
        bytes32[] memory app_ids = applicant_applications[applicant];
        Application[] memory result = new Application[](app_ids.length);

        for (uint i = 0; i < app_ids.length; i++) {
            result[i] = applications[app_ids[i]];
        }

        return result;
    }

    /// @notice Get applications by status
    /// @param status The status to filter by
    /// @return Array of application details
    function getApplicationsByStatus(
        SystemEnums.ApplicationStatus status
    ) external view returns (Application[] memory) {
        bytes32[] memory app_ids = status_applications[status];
        Application[] memory result = new Application[](app_ids.length);

        for (uint i = 0; i < app_ids.length; i++) {
            result[i] = applications[app_ids[i]];
        }

        return result;
    }

    /// @notice Get the number of applications for a job
    /// @param job_id The ID of the job
    /// @return The number of applications
    function getApplicationCount(
        bytes32 job_id
    ) external view returns (uint256) {
        return job_applications[job_id].length;
    }

    /// @notice Get all job IDs that a user has applied to
    /// @param applicant The address of the applicant
    /// @return Array of job IDs the applicant has applied to
    function getJobIDsAppliedByUser(
        address applicant
    ) external view returns (bytes32[] memory) {
        bytes32[] memory app_ids = applicant_applications[applicant];
        bytes32[] memory job_ids = new bytes32[](app_ids.length);

        for (uint i = 0; i < app_ids.length; i++) {
            job_ids[i] = applications[app_ids[i]].job_id;
        }

        return job_ids;
    }


    // ========================= SETTER FUNCTIONS =========================
    /// @notice Set the JobManager contract address
    /// @param job_manager_address Address of the JobManager contract
    function setJobManagerAddress(address job_manager_address)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            job_manager_address != address(0),
            "Invalid JobManager address"
        );
        job_manager = IJobManager(job_manager_address);
    }

    function setRecruiterSubscriptionAddress(address addr)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(addr != address(0), "Invalid address");
        recruiter_subscription = IRecruiterSubscription(addr);
    }

    // ========================= HELPER FUNCTIONS =========================
    /// @notice Helper function to remove an application from a status array
    /// @param application_id The application ID to remove
    /// @param status The status array to remove from
    function _removeApplicationFromStatus(
        bytes32 application_id,
        SystemEnums.ApplicationStatus status
    ) private {
        bytes32[] storage status_array = status_applications[status];

        for (uint256 i = 0; i < status_array.length; i++) {
            if (status_array[i] == application_id) {
                // Replace with last element and pop
                status_array[i] = status_array[status_array.length - 1];
                status_array.pop();
                break;
            }
        }
    }

    /// @notice Check if a status transition is valid
    /// @param current_status The current status of the application
    /// @param new_status The new status to transition to
    /// @return bool True if the transition is valid, false otherwise
    function isValidStatusTransition(
        SystemEnums.ApplicationStatus current_status,
        SystemEnums.ApplicationStatus new_status
    ) public pure returns (bool) {
        // If current and new status are the same, it's not a valid transition
        if (current_status == new_status) {
            return false;
        }

        // Define valid transitions based on the state diagram
        if (current_status == SystemEnums.ApplicationStatus.PENDING) {
            return
                new_status == SystemEnums.ApplicationStatus.REVIEWING ||
                new_status == SystemEnums.ApplicationStatus.WITHDRAWN;
        } else if (current_status == SystemEnums.ApplicationStatus.REVIEWING) {
            return
                new_status == SystemEnums.ApplicationStatus.SHORTLISTED ||
                new_status == SystemEnums.ApplicationStatus.REJECTED ||
                new_status == SystemEnums.ApplicationStatus.WITHDRAWN;
        } else if (
            current_status == SystemEnums.ApplicationStatus.SHORTLISTED
        ) {
            return
                new_status == SystemEnums.ApplicationStatus.INTERVIEWED ||
                new_status == SystemEnums.ApplicationStatus.HIRED ||
                new_status == SystemEnums.ApplicationStatus.REJECTED ||
                new_status == SystemEnums.ApplicationStatus.WITHDRAWN;
        } else if (
            current_status == SystemEnums.ApplicationStatus.INTERVIEWED
        ) {
            return
                new_status == SystemEnums.ApplicationStatus.HIRED ||
                new_status == SystemEnums.ApplicationStatus.REJECTED ||
                new_status == SystemEnums.ApplicationStatus.WITHDRAWN;
        }
        // Final states cannot transition to any other state
        else if (
            current_status == SystemEnums.ApplicationStatus.HIRED ||
            current_status == SystemEnums.ApplicationStatus.REJECTED ||
            current_status == SystemEnums.ApplicationStatus.WITHDRAWN
        ) {
            return false;
        }

        // Any other transition not explicitly defined is invalid
        return false;
    }
}