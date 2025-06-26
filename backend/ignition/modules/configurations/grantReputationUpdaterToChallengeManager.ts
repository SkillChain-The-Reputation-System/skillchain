import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "../ReputationManager";
import ChallengeManagerModule from "../ChallengeManager";

const GrantReputationUpdaterToChallengeManagerModule = buildModule(
  "GrantReputationUpdaterToChallengeManagerModule",
  (m) => {
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(reputationManager, "grantReputationUpdaterRole", [challengeManager], {
      id: "grantReputationUpdaterToChallengeManager",
    });

    return {
      reputationManager,
      challengeManager,
    };
  }
);

export default GrantReputationUpdaterToChallengeManagerModule;
