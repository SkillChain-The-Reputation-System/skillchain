import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "../ReputationManager";
import ChallengeManagerModule from "../ChallengeManager";

const SetReputationManagerOnChallengeManagerModule = buildModule(
  "SetReputationManagerOnChallengeManagerModule",
  (m) => {
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(challengeManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnChallengeManager",
    });

    return {
      reputationManager,
      challengeManager,
    };
  }
);

export default SetReputationManagerOnChallengeManagerModule;
