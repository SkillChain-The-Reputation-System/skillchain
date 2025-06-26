import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterSubscriptionModule from "../RecruiterSubscription";
import ReputationManagerModule from "../ReputationManager";

const SetReputationManagerOnRecruiterSubscriptionModule = buildModule(
  "SetReputationManagerOnRecruiterSubscriptionModule",
  (m) => {
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);
    const { reputationManager } = m.useModule(ReputationManagerModule);

    m.call(recruiterSubscription, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnRecruiterSubscription",
    });

    return {
      recruiterSubscription,
      reputationManager,
    };
  }
);

export default SetReputationManagerOnRecruiterSubscriptionModule;
