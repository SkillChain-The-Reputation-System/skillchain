import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "./ChallengeManager";
import LibrariesModule from "./Libraries";

const ModerationEscrowModule = buildModule("ModerationEscrowModule", (m) => {
  const { challengeManager, reputationManager, roleManager } = m.useModule(ChallengeManagerModule);
  const { rewardTokenFormulas } = m.useModule(LibrariesModule);

  // Deploy ModerationEscrow contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const moderationEscrow = m.contract("ModerationEscrow", [], {
    libraries: {
      RewardTokenFormulas: rewardTokenFormulas,
    },
  });

  // Set the challenge manager address on the ModerationEscrow
  m.call(moderationEscrow, "setChallengeManagerAddress", [challengeManager]);

  // Grant CHALLENGE_MANAGER_ROLE to the ChallengeManager contract
  m.call(moderationEscrow, "grantChallengeManagerRole", [challengeManager], {
    id: "grantChallengeManagerRoleToManager",
  });

  // Set the reputation manager address on the ModerationEscrow
  m.call(moderationEscrow, "setReputationManagerAddress", [reputationManager]);

  // Set the moderation escrow address on the ChallengeManager
  m.call(challengeManager, "setModerationEscrowAddress", [moderationEscrow]);

  return { moderationEscrow, challengeManager, reputationManager, roleManager };
});

export default ModerationEscrowModule;
