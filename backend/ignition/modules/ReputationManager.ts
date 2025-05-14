import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";


const ReputationManagerModule = buildModule("ReputationManagerModule", (m) => {
  // Reference the libraries from the other module
  const { mathUtils, weights } = m.useModule(LibrariesModule);
  
    // Deploy contract with linked libraries
  const reputationManager = m.contract("ReputationManager", [], {
    libraries: {
      "contracts/Constants.sol:MathUtils": mathUtils,
      "contracts/Constants.sol:Weights": weights
    }
  });

  return { reputationManager };
});

export default ReputationManagerModule;