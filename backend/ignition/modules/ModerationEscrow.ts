import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "./ChallengeManager";
import LibrariesModule from "./Libraries";

const ModerationEscrowModule = buildModule("ModerationEscrowModule", (m) => {
  const { challengeManager } = m.useModule(ChallengeManagerModule);
  const { rewardTokenFormulas, penaltyTokenFormulas } =
    m.useModule(LibrariesModule);

  // Deploy ModerationEscrow contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const moderationEscrow = m.contract("ModerationEscrow", [], {
    libraries: {
      RewardTokenFormulas: rewardTokenFormulas,
      PenaltyTokenFormulas: penaltyTokenFormulas,
    },
  });

  // Set the challenge manager address on the ModerationEscrow
  m.call(moderationEscrow, "setChallengeManagerAddress", [challengeManager]);

  // Grant CHALLENGE_MANAGER_ROLE to the ChallengeManager contract
  m.call(moderationEscrow, "grantChallengeManagerRole", [challengeManager], {
    id: "grantChallengeManagerRoleToManager",
  });
  // Set the moderation escrow address on the ChallengeManager
  m.call(challengeManager, "setModerationEscrowAddress", [moderationEscrow]);

  return { moderationEscrow, challengeManager };
});

export default ModerationEscrowModule;
