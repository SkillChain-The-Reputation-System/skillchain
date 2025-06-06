import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "./ChallengeManager";
import ModerationEscrowModule from "./ModerationEscrow";
import LibrariesModule from "./Libraries";

const ChallengeCostManagerModule = buildModule(
  "ChallengeCostManagerModule",
  (m) => {
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { moderationEscrow } = m.useModule(ModerationEscrowModule);
    const { weights, challengeCostFormulas } = m.useModule(LibrariesModule);

    // Deploy ChallengeCostManager contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
    const challengeCostManager = m.contract("ChallengeCostManager", [], {
      libraries: {
        Weights: weights,
        ChallengeCostFormulas: challengeCostFormulas,
      },
    });

    // Set the challenge manager address on the ChallengeCostManager
    m.call(challengeCostManager, "setChallengeManagerAddress", [
      challengeManager,
    ]);

    // Set the moderation escrow address on the ChallengeCostManager
    m.call(challengeCostManager, "setModerationEscrowAddress", [
      moderationEscrow,
    ]);

    return { challengeCostManager, challengeManager, moderationEscrow };
  }
);

export default ChallengeCostManagerModule;
