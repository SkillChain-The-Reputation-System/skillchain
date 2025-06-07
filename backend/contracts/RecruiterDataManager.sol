// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRecruiterSubscription.sol";

contract RecruiterDataManager is AccessControl {
    // ================= STRUCTS =================
    // Struct to hold recruiter data
    struct RecruiterProfile {
        address recruiter_address;
        string data_id; // Unique identifier for the recruiter's data stored on Irys.
    }

    
    // ================= STATE VARIABLES =================
    // Mapping to store recruiter data: address => RecruiterProfile
    mapping(address => RecruiterProfile) private recruiters;
    
    // Mapping to check if an address has created a recruiter profile: address => bool
    mapping(address => bool) private recruiter_profile_created;

    IRecruiterSubscription private recruiter_subscription;

    
    // ================= MODIFIERS =================
    /**
     * @notice Modifier to check if a recruiter has created their profile.
     * @param _recruiter_address The address to check for profile creation.
     */
    modifier onlyRecruiterWithProfile(address _recruiter_address) {
        require(recruiter_profile_created[_recruiter_address], "Recruiter profile not created");
        _;
    }

    /**
     * @notice Modifier to check if a recruiter has not created their profile yet.
     * @param _recruiter_address The address to check for profile creation.
     */
    modifier onlyRecruiterWithoutProfile(address _recruiter_address) {
        require(!recruiter_profile_created[_recruiter_address], "Recruiter profile already created");
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
    

    // ================= EVENTS =================
    // Events for recruiter profile management activities
    event RecruiterProfileCreated(address indexed recruiter_address, string data_id);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    
    // ================= METHODS =================
    /**
     * @notice Creates a new recruiter profile with the provided data ID.
     * @dev This function is for creating a recruiter profile, not for granting recruiter role.
     * @dev Recruiter role management is handled by other contracts in the system.
     * @param _data_id The unique identifier for the recruiter's profile data stored on Irys.
     * Emits a {RecruiterProfileCreated} event upon successful profile creation.
     */
    function createRecruiterProfile(
        string calldata _data_id
    ) external onlySubscribedRecruiter onlyRecruiterWithoutProfile(msg.sender) {
        // Ensure the data ID is not empty
        require(bytes(_data_id).length > 0, "Data ID cannot be empty");
        
        // Create a new RecruiterProfile struct and store it in the mapping
        recruiters[msg.sender] = RecruiterProfile({recruiter_address: msg.sender, data_id: _data_id});

        // Mark the recruiter profile as created
        recruiter_profile_created[msg.sender] = true;

        emit RecruiterProfileCreated(msg.sender, _data_id);
    }    
    

    // ================= GETTERS =================
    /**
     * @notice Checks if a recruiter has created their profile.
     * @param _recruiter_address The address to check.
     * @return bool Returns true if the recruiter profile is created, false otherwise.
     */
    function hasRecruiterProfile(
        address _recruiter_address
    ) external view returns (bool) {
        return recruiter_profile_created[_recruiter_address];
    }

    /**
     * @notice Gets the data ID of a recruiter with a created profile.
     * @param _recruiter_address The address of the recruiter.
     * @return string The data ID of the recruiter's profile.
     */
    function getRecruiterDataId(
        address _recruiter_address
    ) external view returns (string memory) {
        return recruiters[_recruiter_address].data_id;
    }    
    
    /**
     * @notice Gets the complete recruiter object for a recruiter with a created profile.
     * @param _recruiter_address The address of the recruiter.
     * @return RecruiterProfile The complete recruiter struct containing address and data ID.
     */
    function getRecruiter(
        address _recruiter_address
    ) external view returns (RecruiterProfile memory) {
        return recruiters[_recruiter_address];
    }

    // ================= SETTER =================
    function setRecruiterSubscriptionAddress(address addr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(addr != address(0), "Invalid address");
        recruiter_subscription = IRecruiterSubscription(addr);
    }
}
