import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "../ChallengeManager";
import ChallengeCostManagerModule from "../ChallengeCostManager";

const SetChallengeCostManagerOnChallengeManagerModule = buildModule(
  "SetChallengeCostManagerOnChallengeManagerModule",
  (m) => {
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);

    m.call(challengeManager, "setChallengeCostManagerAddress", [challengeCostManager], {
      id: "setChallengeCostManagerOnChallengeManager",
    });

    return {
      challengeManager,
      challengeCostManager,
    };
  }
);

export default SetChallengeCostManagerOnChallengeManagerModule;
