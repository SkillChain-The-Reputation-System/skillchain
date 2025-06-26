import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MeetingManagerModule = buildModule("MeetingManagerModule", (m) => {
  // Phase 1: Deploy MeetingManager contract without dependencies
  const meetingManager = m.contract("MeetingManager");

  return { meetingManager };
});

export default MeetingManagerModule;
