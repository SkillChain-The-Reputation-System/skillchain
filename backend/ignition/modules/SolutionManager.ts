import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SolutionManagerModule = buildModule("SolutionManagerModule", (m) => {
  // Phase 1: Deploy SolutionManager contract without any dependencies
  const solutionManager = m.contract("SolutionManager");

  return { solutionManager };
});

export default SolutionManagerModule;
