import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";

const RecruiterSubscriptionModule = buildModule("RecruiterSubscriptionModule", (m) => {
  const { reputationManager } = m.useModule(ReputationManagerModule);
  
  const recruiterSubscription = m.contract("RecruiterSubscription");
  
  // Set the reputation manager address on the RecruiterSubscription
  m.call(recruiterSubscription, "setReputationManagerAddress", [reputationManager]);
  
  return { recruiterSubscription };
});

export default RecruiterSubscriptionModule;
