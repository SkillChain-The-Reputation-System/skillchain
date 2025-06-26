import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "../ReputationManager";
import RoleManagerModule from "../RoleManager";

const SetReputationManagerOnRoleManagerModule = buildModule(
  "SetReputationManagerOnRoleManagerModule",
  (m) => {
    const { reputationManager } = m.useModule(ReputationManagerModule);
    const { roleManager } = m.useModule(RoleManagerModule);

    m.call(roleManager, "setReputationManagerAddress", [reputationManager], {
      id: "setReputationManagerOnRoleManager",
    });

    return {
      reputationManager,
      roleManager,
    };
  }
);

export default SetReputationManagerOnRoleManagerModule;
