import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import WeightsModule from "./Weights";

const ReputationFormulasModule = buildModule("ReputationFormulasModule", (m) => {
  const { weights } = m.useModule(WeightsModule);
  
  const reputationFormulas = m.library("ReputationFormulas", {
    libraries: {
      Weights: weights,
    },
  });

  return { reputationFormulas };
});

export default ReputationFormulasModule;
