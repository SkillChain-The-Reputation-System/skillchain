import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeCostManagerModule from "../ChallengeCostManager";
import ChallengeManagerModule from "../ChallengeManager";

const GrantChallengeManagerRoleOnChallengeCostManagerModule = buildModule(
  "GrantChallengeManagerRoleOnChallengeCostManagerModule",
  (m) => {
    const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(challengeCostManager, "grantChallengeManagerRole", [challengeManager], {
      id: "grantChallengeManagerRoleOnChallengeCostManager",
    });

    return {
      challengeCostManager,
      challengeManager,
    };
  }
);

export default GrantChallengeManagerRoleOnChallengeCostManagerModule;
