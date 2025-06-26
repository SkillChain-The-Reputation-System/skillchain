import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MeetingManagerModule from "../MeetingManager";
import RecruiterSubscriptionModule from "../RecruiterSubscription";

const SetRecruiterSubscriptionOnMeetingManagerModule = buildModule(
  "SetRecruiterSubscriptionOnMeetingManagerModule",
  (m) => {
    const { meetingManager } = m.useModule(MeetingManagerModule);
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

    m.call(meetingManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnMeetingManager",
    });

    return {
      meetingManager,
      recruiterSubscription,
    };
  }
);

export default SetRecruiterSubscriptionOnMeetingManagerModule;
