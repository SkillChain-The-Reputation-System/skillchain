import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";

const ReputationManagerModule = buildModule("ReputationManagerModule", (m) => {
  const { mathUtils, weights } = m.useModule(LibrariesModule);

  // Deploy ReputationManager contract (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const reputationManager = m.contract("ReputationManager", [], {
    libraries: {
      MathUtils: mathUtils,
      Weights: weights,
    },
  });

  return { reputationManager };
});

export default ReputationManagerModule;