import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "../ReputationManager";
import SolutionManagerModule from "../SolutionManager";

const GrantReputationUpdaterToSolutionManagerModule = buildModule(
  "GrantReputationUpdaterToSolutionManagerModule",
  (m) => {
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { solutionManager } = m.useModule(SolutionManagerModule);

    m.call(reputationManager, "grantReputationUpdaterRole", [solutionManager], {
      id: "grantReputationUpdaterToSolutionManager",
    });

    return {
      reputationManager,
      solutionManager,
    };
  }
);

export default GrantReputationUpdaterToSolutionManagerModule;
