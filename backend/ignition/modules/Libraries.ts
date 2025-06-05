import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const mathUtils = m.library("MathUtils");
  const weights = m.library("Weights");
  const rewardTokenFormulas = m.library("RewardTokenFormulas");
  const penaltyTokenFormulas = m.library("PenaltyTokenFormulas");
  
  return { mathUtils, weights, rewardTokenFormulas, penaltyTokenFormulas };
});

export default LibrariesModule;