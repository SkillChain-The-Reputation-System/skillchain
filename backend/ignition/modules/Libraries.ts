import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import WeightsModule from "./Weights";
import RewardTokenFormulasModule from "./RewardTokenFormulas";
import ChallengeCostFormulasModule from "./ChallengeCostFormulas";
import RecruitmentFeeFormulasModule from "./RecruitmentFeeFormulas";
import ReputationFormulasModule from "./ReputationFormulas";

const LibrariesModule = buildModule("LibrariesModule", (m) => {
  const { weights } = m.useModule(WeightsModule);
  const { rewardTokenFormulas } = m.useModule(RewardTokenFormulasModule);
  const { challengeCostFormulas } = m.useModule(ChallengeCostFormulasModule);
  const { recruitmentFeeFormulas } = m.useModule(RecruitmentFeeFormulasModule);
  const { reputationFormulas } = m.useModule(ReputationFormulasModule);

  return { weights, rewardTokenFormulas, challengeCostFormulas, recruitmentFeeFormulas, reputationFormulas };
});

export default LibrariesModule;