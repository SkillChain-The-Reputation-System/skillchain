import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeCostManagerModule from "../ChallengeCostManager";
import ModerationEscrowModule from "../ModerationEscrow";

const SetModerationEscrowOnChallengeCostManagerModule = buildModule(
  "SetModerationEscrowOnChallengeCostManagerModule",
  (m) => {
    const { challengeCostManager } = m.useModule(ChallengeCostManagerModule);
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);

    m.call(challengeCostManager, "setModerationEscrowAddress", [moderationEscrow], {
      id: "setModerationEscrowOnChallengeCostManager",
    });

    return {
      challengeCostManager,
      moderationEscrow,
    };
  }
);

export default SetModerationEscrowOnChallengeCostManagerModule;
