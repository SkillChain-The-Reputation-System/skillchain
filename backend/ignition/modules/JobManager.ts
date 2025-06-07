import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterSubscriptionModule from "./RecruiterSubscription";

const JobManagerModule = buildModule("JobManagerModule", (m) => {
  const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

  const jobManager = m.contract("JobManager");

  m.call(jobManager, "setRecruiterSubscriptionAddress", [recruiterSubscription]);

  return { jobManager, recruiterSubscription };
});

export default JobManagerModule;
