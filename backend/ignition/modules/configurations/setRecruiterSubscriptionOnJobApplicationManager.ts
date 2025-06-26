import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import JobApplicationManagerModule from "../JobApplicationManager";
import RecruiterSubscriptionModule from "../RecruiterSubscription";

const SetRecruiterSubscriptionOnJobApplicationManagerModule = buildModule(
  "SetRecruiterSubscriptionOnJobApplicationManagerModule",
  (m) => {
    const { jobApplicationManager } = m.useModule(JobApplicationManagerModule);
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

    m.call(jobApplicationManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnJobApplicationManager",
    });

    return {
      jobApplicationManager,
      recruiterSubscription,
    };
  }
);

export default SetRecruiterSubscriptionOnJobApplicationManagerModule;
