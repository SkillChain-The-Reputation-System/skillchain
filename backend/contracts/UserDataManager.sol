// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserDataManager {
    // ================= STRUCTS =================
    // Struct to hold user data
    struct User {
        address user_address;
        string data_id; // Unique identifier for the user's data stored on Irys.
    }

    // ================= STATE VARIABLES =================
    // Mapping to store user data: address => User
    mapping(address => User) private users;

    // Mapping to check if an address is a registered user: address => bool
    mapping(address => bool) private user_registered;

    // ================= MODIFIERS =================
    /**
     * @notice Modifier to check if a user is registered.
     * @param _user_address The address to check for registration.
     */
    modifier onlyRegisteredUser(address _user_address) {
        require(user_registered[_user_address], "User not registered");
        _;
    }

    /**
     * @notice Modifier to check if a user is not already registered.
     * @param _user_address The address to check for registration.
     */
    modifier onlyUnregisteredUser(address _user_address) {
        require(!user_registered[_user_address], "User already registered");
        _;
    }

    // ================= EVENTS =================
    // Events for user management activities
    event UserDataUpdated(address indexed user_address, string data_id);

    // ================= METHODS =================
    /**
     * @notice Registers a new user with the provided data ID.
     * @param _data_id The unique identifier for the user's data stored on Irys.
     * Emits a {UserDataUpdated} event upon successful registration.
     */
    function registerNewUser(
        string calldata _data_id
    ) external onlyUnregisteredUser(msg.sender) {
        // Ensure the data ID is not empty
        require(bytes(_data_id).length > 0, "Data ID cannot be empty");

        // Create a new User struct and store it in the mapping
        users[msg.sender] = User({user_address: msg.sender, data_id: _data_id});

        // Mark the user as registered
        user_registered[msg.sender] = true;

        emit UserDataUpdated(msg.sender, _data_id);
    }

    // ================= GETTERS =================
    /**
     * @notice Checks if a user is already registered.
     * @param _user_address The address to check.
     * @return bool Returns true if the user is registered, false otherwise.
     */
    function isUserRegistered(
        address _user_address
    ) external view returns (bool) {
        return user_registered[_user_address];
    }

    /**
     * @notice Gets the data ID of a registered user.
     * @param _user_address The address of the user.
     * @return string The data ID of the user.
     */
    function getUserDataId(
        address _user_address
    ) external view returns (string memory) {
        return users[_user_address].data_id;
    }

    /**
     * @notice Gets the complete user object for a registered user.
     * @param _user_address The address of the user.
     * @return User The complete user struct containing address and data ID.
     */
    function getUser(
        address _user_address
    ) external view returns (User memory) {
        return users[_user_address];
    }
}
