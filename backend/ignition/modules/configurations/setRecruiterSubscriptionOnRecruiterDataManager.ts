import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterDataManagerModule from "../RecruiterDataManager";
import RecruiterSubscriptionModule from "../RecruiterSubscription";

const SetRecruiterSubscriptionOnRecruiterDataManagerModule = buildModule(
  "SetRecruiterSubscriptionOnRecruiterDataManagerModule",
  (m) => {
    const { recruiterDataManager } = m.useModule(RecruiterDataManagerModule);
    const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);

    m.call(recruiterDataManager, "setRecruiterSubscriptionAddress", [recruiterSubscription], {
      id: "setRecruiterSubscriptionOnRecruiterDataManager",
    });

    return {
      recruiterDataManager,
      recruiterSubscription,
    };
  }
);

export default SetRecruiterSubscriptionOnRecruiterDataManagerModule;
