import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ModerationEscrowModule from "../ModerationEscrow";
import ChallengeManagerModule from "../ChallengeManager";

const GrantChallengeManagerRoleOnModerationEscrowModule = buildModule(
  "GrantChallengeManagerRoleOnModerationEscrowModule",
  (m) => {
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(moderationEscrow, "grantChallengeManagerRole", [challengeManager], {
      id: "grantChallengeManagerRoleOnModerationEscrow",
    });

    return {
      moderationEscrow,
      challengeManager,
    };
  }
);

export default GrantChallengeManagerRoleOnModerationEscrowModule;
