import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SolutionManagerModule from "../SolutionManager";
import RoleManagerModule from "../RoleManager";

const SetRoleManagerOnSolutionManagerModule = buildModule(
  "SetRoleManagerOnSolutionManagerModule",
  (m) => {
    const { solutionManager } = m.useModule(SolutionManagerModule);
    const { roleManager } = m.useModule(RoleManagerModule);

    m.call(solutionManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnSolutionManager",
    });

    return {
      solutionManager,
      roleManager,
    };
  }
);

export default SetRoleManagerOnSolutionManagerModule;
