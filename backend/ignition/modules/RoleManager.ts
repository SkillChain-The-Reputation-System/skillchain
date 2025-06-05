import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ReputationManagerModule from "./ReputationManager";

const RoleManagerModule = buildModule("RoleManagerModule", (m) => {
  const { reputationManager } = m.useModule(ReputationManagerModule);
  
  // Deploy RoleManager contract without constructor parameters
  const roleManager = m.contract("RoleManager");
  
  // Set the reputation manager address on the RoleManager
  m.call(roleManager, "setReputationManagerAddress", [reputationManager]);
  
  // Set the role manager address on the ReputationManager
  m.call(reputationManager, "setRoleManagerAddress", [roleManager]);

  return { roleManager };
});

export default RoleManagerModule;
