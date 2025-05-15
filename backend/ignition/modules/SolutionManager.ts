import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SolutionManagerModule = buildModule("SolutionManagerModule", (m) => {
  const solutionManager = m.contract("SolutionManager");
  return { solutionManager };
});

export default SolutionManagerModule;