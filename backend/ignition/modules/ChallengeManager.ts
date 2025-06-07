import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";
import SolutionManagerModule from "./SolutionManager";
import RoleManagerModule from "./RoleManager";

const ChallengeManagerModule = buildModule("ChallengeManagerModule", (m) => {
  const { reputationManager } = m.useModule(ReputationManagerModule);
  const { solutionManager } = m.useModule(SolutionManagerModule);
  const { roleManager } = m.useModule(RoleManagerModule);
  
  const challengeManager = m.contract("ChallengeManager");

  // Set the reputation manager address on the ChallengeManager
  m.call(challengeManager, "setReputationManagerAddress", [reputationManager]);
  // Set the solution manager address on the ChallengeManager
  m.call(challengeManager, "setSolutionManagerAddress", [solutionManager]);
  // Set the role manager address on the ChallengeManager
  m.call(challengeManager, "setRoleManagerAddress", [roleManager]);

  // Set the challenge manager address on the SolutionManager
  m.call(solutionManager, "setChallengeManagerAddress", [challengeManager]);
  // Set the reputation manage addrss on the SolutionManager
  m.call(solutionManager, "setReputationManagerAddress", [reputationManager]);
  // Grant REPUTATION_UPDATER_ROLE to ChallengeManager and SolutionManager
  m.call(reputationManager, "grantReputationUpdaterRole", [challengeManager], {
    id: "grantReputationUpdaterToChallengeManager",
  }); // Call the same function with different parameters -> Need a unique ID to avoid error when deploying
  m.call(reputationManager, "grantReputationUpdaterRole", [solutionManager], {
    id: "grantReputationUpdaterToSolutionManager",
  }); // Call the same function with different parameters -> Need a unique ID to avoid error when deploying

  // Return all contracts
  return { challengeManager, reputationManager, solutionManager, roleManager };
});

export default ChallengeManagerModule;
