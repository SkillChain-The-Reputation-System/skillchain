import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ChallengeManagerModule from "../ChallengeManager";
import SolutionManagerModule from "../SolutionManager";

const SetSolutionManagerOnChallengeManagerModule = buildModule(
  "SetSolutionManagerOnChallengeManagerModule",
  (m) => {
    const { challengeManager } = m.useModule(ChallengeManagerModule);
    const { solutionManager } = m.useModule(SolutionManagerModule);

    m.call(challengeManager, "setSolutionManagerAddress", [solutionManager], {
      id: "setSolutionManagerOnChallengeManager",
    });

    return {
      challengeManager,
      solutionManager,
    };
  }
);

export default SetSolutionManagerOnChallengeManagerModule;
