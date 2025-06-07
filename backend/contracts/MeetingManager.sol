// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Constants.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IRecruiterSubscription.sol";

contract MeetingManager is AccessControl {
    // ========================= STRUCTS =========================
    struct Meeting {
        bytes32 id;
        bytes32 application_id;
        string txid;
        SystemEnums.MeetingStatus status;
        uint256 created_at;
        uint256 ended_at;
    }

    // ========================= STATE VARIABLES =========================
    // Mapping: Meeting ID => Meeting struct
    mapping(bytes32 => Meeting) meetings;
    // Mapping: Application ID => Meeting ID
    mapping(bytes32 => bytes32) application_to_meeting;
    // Mapping: Application ID => Is this application already has a meeting
    mapping(bytes32 => bool) is_application_has_meeting;
    // Mapping: Recruiter Address => Array of Meeting IDs
    mapping(address => bytes32[]) recruiter_to_meetings;
    // Mapping: Recruiter Address + Meeting ID => Is recruiter own this meeting
    mapping(address => mapping(bytes32 => bool)) is_recruiter_own_meeting;

    IRecruiterSubscription private recruiter_subscription;

    // ========================= EVENTS =========================
    event MeetingScheduled(
        bytes32 indexed id,
        bytes32 application_id,
        address recruiter,
        string txid,
        uint256 created_at
    );

    event MeetingCompleted(bytes32 indexed id, uint256 ended_at);

    event MeetingCancelled(bytes32 indexed id, uint256 ended_at);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ========================= MODIFIERS =========================
    modifier onlyMeetingIsPending(bytes32 id) {
        require(
            meetings[id].status == SystemEnums.MeetingStatus.PENDING,
            "This meeting is not in pending"
        );
        _;
    }

    modifier onlyRecruiterOwnMeeting(address recruiter, bytes32 id) {
        require(
            is_recruiter_own_meeting[recruiter][id],
            "Recruiter doesn't own this meeting"
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

    // ========================= MEETING MANAGEMENT =========================
    /// @notice Create a meeting
    /// @param _application_id room ID that generated at front-end
    /// @param _txid txid pointing to meeting details stored off-chain (Irys)
    function scheduleMeeting(
        bytes32 _application_id,
        string calldata _txid
    ) external onlySubscribedRecruiter {
        require(
            !is_application_has_meeting[_application_id],
            "This application already has a meeting"
        );

        uint256 createdAt = block.timestamp * 1000;
        // generate meeting ID
        bytes32 id = keccak256(abi.encodePacked(msg.sender, createdAt));

        meetings[id] = Meeting({
            id: id,
            application_id: _application_id,
            txid: _txid,
            status: SystemEnums.MeetingStatus.PENDING,
            created_at: createdAt,
            ended_at: 0
        });

        // mark meeting for this application
        application_to_meeting[_application_id] = id;
        is_application_has_meeting[_application_id] = true;
        // store this meeting to recruiter
        recruiter_to_meetings[msg.sender].push(id);
        is_recruiter_own_meeting[msg.sender][id] = true;

        emit MeetingScheduled(
            id,
            _application_id,
            msg.sender,
            _txid,
            createdAt
        );
    }

    /// @notice complete a meeting
    /// @param id meeting ID to be completed
    function completeMeeting(
        bytes32 id
    )
        external
        onlySubscribedRecruiter
        onlyRecruiterOwnMeeting(msg.sender, id)
        onlyMeetingIsPending(id)
    {
        uint256 endedAt = block.timestamp * 1000;

        Meeting storage meeting = meetings[id];
        meeting.status = SystemEnums.MeetingStatus.COMPLETED;
        meeting.ended_at = endedAt;

        is_application_has_meeting[meeting.application_id] = false;

        emit MeetingCompleted(id, endedAt);
    }

    /// @notice cancel a meeting
    /// @param id meeting ID to be cancelled
    function cancelMeeting(
        bytes32 id
    )
        external
        onlySubscribedRecruiter
        onlyRecruiterOwnMeeting(msg.sender, id)
        onlyMeetingIsPending(id)
    {
        uint256 endedAt = block.timestamp * 1000;

        Meeting storage meeting = meetings[id];
        meeting.status = SystemEnums.MeetingStatus.CANCELLED;
        meeting.ended_at = endedAt;

        is_application_has_meeting[meeting.application_id] = false;

        emit MeetingCancelled(id, endedAt);
    }

    // ========================= SETTER FUNCTIONS =========================
    function setRecruiterSubscriptionAddress(address addr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(addr != address(0), "Invalid address");
        recruiter_subscription = IRecruiterSubscription(addr);
    }

    // ========================= VIEW FUNCTIONS =========================
    /// @notice Get all meetings by Recruiter
    /// @param _recruiter The recruiter address
    /// @return List of meeting details
    function getMeetingsByRecruiter(
        address _recruiter
    ) public view returns (Meeting[] memory) {
        bytes32[] memory meetingIds = recruiter_to_meetings[_recruiter];

        Meeting[] memory meetingList = new Meeting[](meetingIds.length);

        for (uint256 i = 0; i < meetingIds.length; i++) {
            meetingList[i] = meetings[meetingIds[i]];
        }

        return meetingList;
    }

    /// @notice Get Meeting by Meeting ID
    /// @param id The meeting ID
    /// @return Meeting detail
    function getMeetingById(bytes32 id) public view returns (Meeting memory) {
        return meetings[id];
    }

    /// @notice Get Meeting by Application ID
    /// @param _application_id The Application ID
    /// @return Meeting detail
    function getMeetingByApplication(
        bytes32 _application_id
    ) public view returns (Meeting memory) {
        return meetings[application_to_meeting[_application_id]];
    }

    /// @notice Get txid of a meeting, which references to stored data off-chain, by meeting ID
    /// @param id The meeting ID
    /// @return Txid of a meeting
    function getMeetingTxIdById(
        bytes32 id
    ) public view returns (string memory) {
        return meetings[id].txid;
    }

    /// @notice Get check if this application already has a pending meeting
    /// @param _application_id The Application ID
    /// @return Boolean
    function checkApplicationHasAMeeting(
        bytes32 _application_id
    ) public view returns (bool) {
        return is_application_has_meeting[_application_id];
    }
}
