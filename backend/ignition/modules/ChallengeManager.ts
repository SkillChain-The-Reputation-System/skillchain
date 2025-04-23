import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChallengeManagerModule = buildModule("ChallengeManagerModule", (m) => {
  const challengeManagerModule = m.contract("ChallengeManager");
  return { challengeManagerModule };
});

export default ChallengeManagerModule;