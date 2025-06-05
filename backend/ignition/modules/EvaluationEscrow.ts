import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SolutionManagerModule from "./SolutionManager";
import LibrariesModule from "./Libraries";

const EvaluationEscrowModule = buildModule("EvaluationEscrowModule", (m) => {
  const { solutionManager } = m.useModule(SolutionManagerModule);
  const { rewardTokenFormulas, penaltyTokenFormulas } = m.useModule(LibrariesModule);

  // Deploy EvaluationEscrow contract with library linking (constructor grants DEFAULT_ADMIN_ROLE to deployer)
  const evaluationEscrow = m.contract("EvaluationEscrow", [], {
    libraries: {
      RewardTokenFormulas: rewardTokenFormulas,
      PenaltyTokenFormulas: penaltyTokenFormulas,
    },
  });

  // Set the solution manager address on the EvaluationEscrow
  m.call(evaluationEscrow, "setSolutionManagerAddress", [solutionManager]);

  // Grant SOLUTION_MANAGER_ROLE to the SolutionManager contract
  m.call(evaluationEscrow, "grantSolutionManagerRole", [solutionManager], {
    id: "grantSolutionManagerRoleToManager",
  });

  return { evaluationEscrow };
});

export default EvaluationEscrowModule;