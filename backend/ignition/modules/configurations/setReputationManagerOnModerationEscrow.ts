import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ModerationEscrowModule from "../ModerationEscrow";
import ReputationManagerModule from "../ReputationManager";

const SetReputationManagerOnModerationEscrowModule = buildModule(
  "SetReputationManagerOnModerationEscrowModule",
  (m) => {
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);
    const { reputationManager } = m.useModule(ReputationManagerModule);

    m.call(moderationEscrow, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnModerationEscrow",
    });

    return {
      moderationEscrow,
      reputationManager,
    };
  }
);

export default SetReputationManagerOnModerationEscrowModule;
