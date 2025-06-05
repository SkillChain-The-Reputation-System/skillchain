import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "./ChallengeManager";

const ModerationEscrowModule = buildModule("ModerationEscrowModule", (m) => {
  const { challengeManager } = m.useModule(ChallengeManagerModule);

  // Deploy ModerationEscrow contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const moderationEscrow = m.contract("ModerationEscrow");

  // Set the challenge manager address on the ModerationEscrow
  m.call(moderationEscrow, "setChallengeManagerAddress", [challengeManager]);

  // Grant CHALLENGE_MANAGER_ROLE to the ChallengeManager contract
  m.call(moderationEscrow, "grantChallengeManagerRole", [challengeManager], {
    id: "grantChallengeManagerRoleToManager",
  });

  // Set the moderation escrow address on the ChallengeManager (if such function exists)
  // Note: This might need to be added to ChallengeManager contract if it doesn't exist yet
  // m.call(challengeManager, "setModerationEscrowAddress", [moderationEscrow]);

  return { moderationEscrow, challengeManager };
});

export default ModerationEscrowModule;
