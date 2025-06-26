import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SolutionManagerModule from "../SolutionManager";
import ChallengeManagerModule from "../ChallengeManager";

const SetChallengeManagerOnSolutionManagerModule = buildModule(
  "SetChallengeManagerOnSolutionManagerModule",
  (m) => {
    const { solutionManager } = m.useModule(SolutionManagerModule);
    const { challengeManager } = m.useModule(ChallengeManagerModule);

    m.call(solutionManager, "setChallengeManagerAddress", [challengeManager], {
      id: "setChallengeManagerOnSolutionManager",
    });

    return {
      solutionManager,
      challengeManager,
    };
  }
);

export default SetChallengeManagerOnSolutionManagerModule;
