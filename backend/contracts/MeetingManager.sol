// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Constants.sol";

contract MeetingManager {
    struct Meeting {
        bytes32 id;
        string room_id;
        address recruiter;
        string txid;
        SystemEnums.MeetingStatus status;
    }

    mapping(bytes32 => Meeting) meetings;

    mapping(address => bytes32[]) recruiter_to_meetings;

    event MeetingScheduled(
        bytes32 indexed id,
        string room_id,
        address recruiter,
        string txid
    );

    event MeetingCompleted(bytes32 indexed id);

    event MeetingCancelled(bytes32 indexed id);

    modifier onlyMeetingIsPending(bytes32 id) {
        require(
            meetings[id].status == SystemEnums.MeetingStatus.PENDING,
            "This meeting is not in pending"
        );
        _;
    }

    modifier onlyRecruiterOwnMeeting(address recruiter, bytes32 id) {
        require(
            recruiter == meetings[id].recruiter,
            "Recruiter doesn't own this meeting"
        );
        _;
    }

    function scheduleMeeting(
        string calldata _room_id,
        string calldata _txid
    ) external {
        bytes32 id = keccak256(abi.encodePacked(msg.sender, block.timestamp));

        meetings[id] = Meeting({
            id: id,
            room_id: _room_id,
            recruiter: msg.sender,
            txid: _txid,
            status: SystemEnums.MeetingStatus.PENDING
        });

        recruiter_to_meetings[msg.sender].push(id);

        emit MeetingScheduled(id, _room_id, msg.sender, _txid);
    }

    function completeMeeting(
        bytes32 id
    )
        external
        onlyRecruiterOwnMeeting(msg.sender, id)
        onlyMeetingIsPending(id)
    {
        Meeting storage meeting = meetings[id];
        meeting.status = SystemEnums.MeetingStatus.COMPLETED;

        emit MeetingCompleted(id);
    }

    function cancelMeeting(
        bytes32 id
    )
        external
        onlyRecruiterOwnMeeting(msg.sender, id)
        onlyMeetingIsPending(id)
    {
        Meeting storage meeting = meetings[id];
        meeting.status = SystemEnums.MeetingStatus.CANCELLED;

        emit MeetingCancelled(id);
    }

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

    function getMeetingById(bytes32 id) public view returns (Meeting memory) {
        return meetings[id];
    }

    function getMeetingTxIdById(
        bytes32 id
    ) public view returns (string memory) {
        return meetings[id].txid;
    }
}
