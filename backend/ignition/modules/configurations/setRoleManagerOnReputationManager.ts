import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "../ReputationManager";
import RoleManagerModule from "../RoleManager";

const SetRoleManagerOnReputationManagerModule = buildModule(
  "SetRoleManagerOnReputationManagerModule",
  (m) => {
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { roleManager } = m.useModule(RoleManagerModule);

    m.call(reputationManager, "setRoleManagerAddress", [roleManager], {
      id: "setRoleManagerOnReputationManager",
    });

    return {
      reputationManager,
      roleManager,
    };
  }
);

export default SetRoleManagerOnReputationManagerModule;
