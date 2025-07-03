import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";

const ChallengeCostManagerModule = buildModule(
  "ChallengeCostManagerModule",
  (m) => {
    const { weights, challengeCostFormulas } = m.useModule(LibrariesModule);

    // Phase 1: Deploy ChallengeCostManager contract with libraries only
    const challengeCostManager = m.contract("ChallengeCostManager", [], {
      libraries: {
        Weights: weights,
        ChallengeCostFormulas: challengeCostFormulas,
      },
    });

    return { challengeCostManager };
  }
);

export default ChallengeCostManagerModule;
