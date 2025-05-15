import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";

const ChallengeManagerModule = buildModule("ChallengeManagerModule", (m) => {
  const { reputationManager } = m.useModule(ReputationManagerModule);
  const challengeManager = m.contract("ChallengeManager");
  // Set the reputation manager address on the ChallengeManager
  m.call(challengeManager, "setReputationManagerAddress", [reputationManager]);

  // Return both contracts
  return { challengeManager, reputationManager };
});

export default ChallengeManagerModule;