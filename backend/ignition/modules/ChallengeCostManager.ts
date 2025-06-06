import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "./ChallengeManager";
import ModerationEscrowModule from "./ModerationEscrow";

const ChallengeCostManagerModule = buildModule("ChallengeCostManagerModule", (m) => {
  const { challengeManager } = m.useModule(ChallengeManagerModule);
  const { moderationEscrow } = m.useModule(ModerationEscrowModule);

  // Deploy ChallengeCostManager contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const challengeCostManager = m.contract("ChallengeCostManager");

  // Set the challenge manager address on the ChallengeCostManager
  m.call(challengeCostManager, "setChallengeManagerAddress", [challengeManager]);

  // Set the moderation escrow address on the ChallengeCostManager
  m.call(challengeCostManager, "setModerationEscrowAddress", [moderationEscrow]);

  return { challengeCostManager, challengeManager, moderationEscrow };
});

export default ChallengeCostManagerModule;
