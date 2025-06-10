import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RoleManagerModule from "./RoleManager";

const SolutionManagerModule = buildModule("SolutionManagerModule", (m) => {
  const solutionManager = m.contract("SolutionManager");
  const { roleManager } = m.useModule(RoleManagerModule);

  m.call(solutionManager, "setRoleManagerAddress", [roleManager]);

  return { solutionManager };
});

export default SolutionManagerModule;
