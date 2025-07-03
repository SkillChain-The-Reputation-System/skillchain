import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChallengeCostFormulasModule = buildModule("ChallengeCostFormulasModule", (m) => {
  const challengeCostFormulas = m.library("ChallengeCostFormulas");

  return { challengeCostFormulas };
});

export default ChallengeCostFormulasModule;
