import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";

const ModerationEscrowModule = buildModule("ModerationEscrowModule", (m) => {
  const { rewardTokenFormulas } = m.useModule(LibrariesModule);

  // Phase 1: Deploy ModerationEscrow contract with libraries only
  const moderationEscrow = m.contract("ModerationEscrow", [], {
    libraries: {
      RewardTokenFormulas: rewardTokenFormulas,
    },
  });

  return { moderationEscrow };
});

export default ModerationEscrowModule;
