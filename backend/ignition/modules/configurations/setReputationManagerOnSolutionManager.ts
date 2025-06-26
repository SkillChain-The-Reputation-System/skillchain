import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SolutionManagerModule from "../SolutionManager";
import ReputationManagerModule from "../ReputationManager";

const SetReputationManagerOnSolutionManagerModule = buildModule(
  "SetReputationManagerOnSolutionManagerModule",
  (m) => {
    const { solutionManager } = m.useModule(SolutionManagerModule);
    const { reputationManager } = m.useModule(ReputationManagerModule);

    m.call(solutionManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnSolutionManager",
    });

    return {
      solutionManager,
      reputationManager,
    };
  }
);

export default SetReputationManagerOnSolutionManagerModule;
