import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RoleManagerModule = buildModule("RoleManagerModule", (m) => {
  // Phase 1: Deploy RoleManager contract without any dependencies
  const roleManager = m.contract("RoleManager");

  return { roleManager };
});

export default RoleManagerModule;
