import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";
import SolutionManagerModule from "./SolutionManager";

const ChallengeManagerModule = buildModule("ChallengeManagerModule", (m) => {
  const { reputationManager } = m.useModule(ReputationManagerModule);
  const { solutionManager } = m.useModule(SolutionManagerModule);
  const challengeManager = m.contract("ChallengeManager");
  // Set the reputation manager address on the ChallengeManager
  m.call(challengeManager, "setReputationManagerAddress", [reputationManager]);
  // Set the solution manager address on the ChallengeManager
  m.call(challengeManager, "setSolutionManagerAddress", [solutionManager]);

  // Return both contracts
  return { challengeManager, reputationManager, solutionManager };
});

export default ChallengeManagerModule;