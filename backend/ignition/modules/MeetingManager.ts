import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterSubscriptionModule from "./RecruiterSubscription";

const MeetingManagerModule = buildModule("MeetingManagerModule", (m) => {
  const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

  const meetingManager = m.contract("MeetingManager");

  m.call(meetingManager, "setRecruiterSubscriptionAddress", [recruiterSubscription]);

  return { meetingManager, recruiterSubscription };
});

export default MeetingManagerModule;
