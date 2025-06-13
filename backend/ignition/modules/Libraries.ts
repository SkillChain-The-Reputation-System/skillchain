import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const weights = m.library("Weights");
  const rewardTokenFormulas = m.library("RewardTokenFormulas");
  const challengeCostFormulas = m.library("ChallengeCostFormulas");
  const recruitmentFeeFormulas = m.library("RecruitmentFeeFormulas");
  const reputationFormulas = m.library("ReputationFormulas", {
    libraries: {
      Weights: weights,
    },
  });

  return { weights, rewardTokenFormulas, challengeCostFormulas, recruitmentFeeFormulas, reputationFormulas };
});

export default LibrariesModule;