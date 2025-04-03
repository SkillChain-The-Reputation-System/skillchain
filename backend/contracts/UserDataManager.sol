// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserDataManager {
    // Struct to hold user data
    struct User {
        string username;
        string cid_avatar;
        address user_address; // Wallet address of the user
    }

    // Mapping to store user data by their wallet address
    mapping(address => User) private users;
    // Mapping to track used usernames
    mapping(string => bool) private usernameTaken;

    // Events for user management activities
    event AvatarUpdated(address indexed user_address, string cid_avatar);
    event UsernameRegistered(address indexed user_address, string username);

    // Update username
    function registerUsername(string calldata _username) external {
        // Check if the user is already registered
        require(bytes(users[msg.sender].username).length == 0, "Username already registered");
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(!usernameTaken[_username], "Username already taken");

        users[msg.sender].username = _username;
        usernameTaken[_username] = true;
        emit UsernameRegistered(msg.sender, _username);
    }

    // Update user avatar
    function updateAvatar(string calldata _cid_avatar) external {
        users[msg.sender].cid_avatar = _cid_avatar;
        emit AvatarUpdated(msg.sender, _cid_avatar);
    }

    // Get username
    function getUsername(
        address _user_address
    ) public view returns (string memory username) {
        return users[_user_address].username;
    }

    // Get user data
    function getAvatar(
        address _user_address
    ) public view returns (string memory cid_avatar) {
        return users[_user_address].cid_avatar;
    }
}
