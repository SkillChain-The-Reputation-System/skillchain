import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SolutionManagerModule = buildModule("SolutionManagerModule", (m) => {
  const solutionManagerModule = m.contract("SolutionManager");
  return { solutionManagerModule };
});

export default SolutionManagerModule;