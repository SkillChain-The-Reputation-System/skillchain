import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterSubscriptionModule from "../RecruiterSubscription";
import JobApplicationManagerModule from "../JobApplicationManager";

const GrantJobApplicationManagerRoleOnRecruiterSubscriptionModule = buildModule(
  "GrantJobApplicationManagerRoleOnRecruiterSubscriptionModule",
  (m) => {
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);
    const { jobApplicationManager } = m.useModule(JobApplicationManagerModule);

    m.call(recruiterSubscription, "grantJobApplicationManagerRole", [jobApplicationManager], {
      id: "grantJobApplicationManagerRoleOnRecruiterSubscription",
    });

    return {
      recruiterSubscription,
      jobApplicationManager,
    };
  }
);

export default GrantJobApplicationManagerRoleOnRecruiterSubscriptionModule;
