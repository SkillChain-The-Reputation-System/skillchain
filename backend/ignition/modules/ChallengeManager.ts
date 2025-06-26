import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChallengeManagerModule = buildModule("ChallengeManagerModule", (m) => {
  // Phase 1: Deploy ChallengeManager contract without any dependencies
  const challengeManager = m.contract("ChallengeManager");

  return { challengeManager };
});

export default ChallengeManagerModule;
