import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeCostManagerModule from "../ChallengeCostManager";
import ChallengeManagerModule from "../ChallengeManager";

const SetChallengeManagerOnChallengeCostManagerModule = buildModule(
  "SetChallengeManagerOnChallengeCostManagerModule",
  (m) => {
    const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(challengeCostManager, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnChallengeCostManager",
    });

    return {
      challengeCostManager,
      challengeManager,
    };
  }
);

export default SetChallengeManagerOnChallengeCostManagerModule;
