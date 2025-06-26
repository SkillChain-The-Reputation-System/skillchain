import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ModerationEscrowModule from "../ModerationEscrow";
import ChallengeManagerModule from "../ChallengeManager";

const SetChallengeManagerOnModerationEscrowModule = buildModule(
  "SetChallengeManagerOnModerationEscrowModule",
  (m) => {
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(moderationEscrow, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnModerationEscrow",
    });

    return {
      moderationEscrow,
      challengeManager,
    };
  }
);

export default SetChallengeManagerOnModerationEscrowModule;
