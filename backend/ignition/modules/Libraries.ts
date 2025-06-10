import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const mathUtils = m.library("MathUtils");
  const weights = m.library("Weights");
  const rewardTokenFormulas = m.library("RewardTokenFormulas");
  const challengeCostFormulas = m.library("ChallengeCostFormulas");
  const recruitmentFeeFormulas = m.library("RecruitmentFeeFormulas");

  return { mathUtils, weights, rewardTokenFormulas, challengeCostFormulas, recruitmentFeeFormulas };
});

export default LibrariesModule;