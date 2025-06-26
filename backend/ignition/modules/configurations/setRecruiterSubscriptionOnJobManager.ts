import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import JobManagerModule from "../JobManager";
import RecruiterSubscriptionModule from "../RecruiterSubscription";

const SetRecruiterSubscriptionOnJobManagerModule = buildModule(
  "SetRecruiterSubscriptionOnJobManagerModule",
  (m) => {
    const { jobManager } = m.useModule(JobManagerModule);
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

    m.call(jobManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnJobManager",
    });

    return {
      jobManager,
      recruiterSubscription,
    };
  }
);

export default SetRecruiterSubscriptionOnJobManagerModule;
