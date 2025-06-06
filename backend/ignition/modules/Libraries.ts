import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const mathUtils = m.library("MathUtils");
  const weights = m.library("Weights");
  const rewardTokenFormulas = m.library("RewardTokenFormulas");
  const penaltyTokenFormulas = m.library("PenaltyTokenFormulas");
  const challengeCostFormulas = m.library("ChallengeCostFormulas");
  
  return { mathUtils, weights, rewardTokenFormulas, penaltyTokenFormulas, challengeCostFormulas };
});

export default LibrariesModule;