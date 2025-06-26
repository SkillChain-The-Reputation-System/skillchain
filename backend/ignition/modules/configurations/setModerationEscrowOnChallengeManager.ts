import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "../ChallengeManager";
import ModerationEscrowModule from "../ModerationEscrow";

const SetModerationEscrowOnChallengeManagerModule = buildModule(
  "SetModerationEscrowOnChallengeManagerModule",
  (m) => {
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);

    m.call(challengeManager, "setModerationEscrowAddress", [moderationEscrow], {
      id: "setModerationEscrowOnChallengeManager",
    });

    return {
      challengeManager,
      moderationEscrow,
    };
  }
);

export default SetModerationEscrowOnChallengeManagerModule;
