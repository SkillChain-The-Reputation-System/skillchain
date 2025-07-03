import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RecruitmentFeeFormulasModule = buildModule("RecruitmentFeeFormulasModule", (m) => {
  const recruitmentFeeFormulas = m.library("RecruitmentFeeFormulas");

  return { recruitmentFeeFormulas };
});

export default RecruitmentFeeFormulasModule;
