import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RecruiterSubscriptionModule from "./RecruiterSubscription";

const RecruiterDataManagerModule = buildModule("RecruiterDataManagerModule", (m) => {
  const { recruiterSubscription } = m.useModule(RecruiterSubscriptionModule);
  const recruiterDataManager = m.contract("RecruiterDataManager");
  m.call(recruiterDataManager, "setRecruiterSubscriptionAddress", [recruiterSubscription]);
  return { recruiterDataManager, recruiterSubscription };
});

export default RecruiterDataManagerModule;