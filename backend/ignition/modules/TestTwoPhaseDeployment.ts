import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import LibrariesModule from "./Libraries";
import ReputationManagerModule from "./ReputationManager";
import RoleManagerModule from "./RoleManager";

/**
 * Test Deployment - Simple Two-Phase Example
 * 
 * This module demonstrates the two-phase deployment with just ReputationManager and RoleManager
 * to verify the circular dependency resolution works.
 */
const TestTwoPhaseDeploymentModule = buildModule("TestTwoPhaseDeploymentModule", (m) => {
  // Phase 1: Deploy contracts independently
  const { reputationManager } = m.useModule(ReputationManagerModule);
  const { roleManager } = m.useModule(RoleManagerModule);
  
  // Phase 2: Configure circular dependencies
  m.call(roleManager, "setReputationManagerAddress", [reputationManager], {
    id: "test_setReputationManagerOnRoleManager",
  });
  m.call(reputationManager, "setRoleManagerAddress", [roleManager], {
    id: "test_setRoleManagerOnReputationManager", 
  });

  return {
    reputationManager,
    roleManager,
  };
});

export default TestTwoPhaseDeploymentModule;
