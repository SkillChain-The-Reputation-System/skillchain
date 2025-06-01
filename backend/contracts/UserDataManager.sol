// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UserDataManager {
    // Struct to hold user data
    struct User {
        string username;
        string avartar_url;
        string bio_url;
    }

    // Mapping to store user data by their wallet address
    mapping(address => User) private users;
    // Mapping to track used usernames
    mapping(string => bool) private usernameTaken;

    // Events for user management activities
    event UsernameUpdated(address indexed user_address, string username);
    event AvatarUpdated(address indexed user_address, string avatar_url);
    event BioUpdated(address indexed user_address, string bio_url);
    event NoDataUpdated(address indexed user_address);

    // Set all user data at once
    function setUserPersonalData(
        string calldata _username,
        string calldata _avatar_url,
        string calldata _bio_url
    ) external {
        bool is_username_requested_not_empty = bytes(_username).length > 0;
        bool is_username_available = checkUsernameAvailable(_username);
        bool is_avartar_url_not_empty = bytes(_avatar_url).length > 0;
        bool is_bio_url_not_empty = bytes(_bio_url).length > 0;
        // Check if new data is not the same as existing data
        bool is_username_not_duplicated = !Strings.equal(
            users[msg.sender].username,
            _username
        );
        bool is_avatar_url_not_duplicated = !Strings.equal(
            users[msg.sender].avartar_url,
            _avatar_url
        );
        bool is_bio_url_not_duplicated = !Strings.equal(
            users[msg.sender].bio_url,
            _bio_url
        );

        // console.log("Input data");
        // console.log("username: %s", _username);
        // console.log("avatar CID: %s", _avatar_url);
        // console.log("bio: %s", _bio_url);

        // console.log("is_username_requested_not_empty: %s", is_username_requested_not_empty);
        // console.log("is_username_available: %s", is_username_available);
        // console.log("is_avartar_cid_not_empty: %s", is_avartar_url_not_empty);
        // console.log("is_bio_not_empty: %s", is_bio_url_not_empty);
        // console.log("is_username_not_duplicated: %s", is_username_not_duplicated);
        // console.log("is_avatar_url_not_duplicated: %s", is_avatar_url_not_duplicated);
        // console.log("is_bio_url_not_duplicated: %s", is_bio_url_not_duplicated);

        // If all conditions are not met, revert the transaction since no update is needed
        if (
            !is_username_requested_not_empty &&
            !is_username_available &&
            !is_avartar_url_not_empty &&
            !is_bio_url_not_empty &&
            !is_username_not_duplicated &&
            !is_avatar_url_not_duplicated &&
            !is_bio_url_not_duplicated
        ) {
            // Emit an event for no data update
            emit NoDataUpdated(msg.sender);
            // Revert the transaction
            revert("No data to update");
        }

        // Update username only if it is not empty, is available and is not duplicated
        if (is_username_requested_not_empty && is_username_available && is_username_not_duplicated) {
            // console.log(
            //     "[Contract_Log] Client (%s) Updating their username from (%s) to: (%s)",
            //     msg.sender,
            //     users[msg.sender].username,                
            //     _username
            // );
            setUsername(_username);
        }

        // Update avatar CID only if it is not empty and is not duplicated
        if (is_avartar_url_not_empty && is_avatar_url_not_duplicated) {
            // console.log(
            //     "[Contract_Log] Client (%s) Updating avatar CID to: %s",
            //     msg.sender,
            //     _cid_avatar
            // );
            setAvatar(_avatar_url);
        }

        // Update bio only if it is not empty and is not duplicated
        if (is_bio_url_not_empty && is_bio_url_not_duplicated) {
            // console.log(
            //     "[Contract_Log] Client (%s) Updating bio to: %s",
            //     msg.sender,
            //     _bio
            // );
            setBio(_bio_url);
        }
    }

    function setUsername(string calldata _username) public {
        // // Ensure the user has already registered a username
        // require(bytes(users[msg.sender].username).length > 0, "Username not registered");
        // // Ensure the username, avatar CID, and bio are not empty
        // require(bytes(_username).length > 0, "Username cannot be empty");
        // // Ensure the new username is not already taken
        // require(!usernameTaken[_username], "Username already taken");

        // Mark old username as available
        usernameTaken[users[msg.sender].username] = false;
        // Update the username in the mapping
        users[msg.sender].username = _username;
        // Mark new username as taken
        usernameTaken[_username] = true;

        // Emit an event for the username update
        // console.log("Username of (%s) updated to: %s", msg.sender, users[msg.sender].username);
        emit UsernameUpdated(msg.sender, users[msg.sender].username);
    }

    function setAvatar(string calldata _avatar_url) public {
        // // Ensure the avatar CID is not empty
        // require(bytes(_cid_avatar).length > 0, "Avatar CID cannot be empty");

        // Update the avatar CID in the mapping
        users[msg.sender].avartar_url = _avatar_url;

        // Emit an event for the avatar update
        // console.log("Avatar of (%s) updated to: %s", msg.sender, users[msg.sender].avartar_url);
        emit AvatarUpdated(msg.sender, _avatar_url);
    }

    function setBio(string calldata _bio_url) public {
        // // Ensure the bio is not empty
        // require(bytes(_bio).length > 0, "Bio cannot be empty");

        // Update the bio in the mapping
        users[msg.sender].bio_url = _bio_url;

        // Emit an event for the bio update
        // console.log("Bio of (%s) updated to: %s", msg.sender, users[msg.sender].bio_url);
        emit BioUpdated(msg.sender, _bio_url);
    }

    // Get username
    function getUsername(
        address user_address
    ) public view returns (string memory) {
        // console.log("Username of (%s) is: %s", user_address, users[user_address].username);
        return users[user_address].username;
    }

    // Get avatar CID
    function getAvatar(
        address user_address
    ) public view returns (string memory) {
        // console.log("Avatar of (%s) is: %s", user_address, users[user_address].avartar_url);
        return users[user_address].avartar_url;
    }

    // Get bio
    function getBio(address user_address) public view returns (string memory) {
        // console.log("Bio of (%s) is: %s", user_address, users[user_address].bio_url);
        return users[user_address].bio_url;
    }

    // Check if a username is available
    function checkUsernameAvailable(
        string calldata _username
    ) public view returns (bool) {
        // console.log("Usename (%s) is available: %s", _username, !usernameTaken[_username]);
        return !usernameTaken[_username];
    }
}
