import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import CompleteDeploymentModule from "./CompleteDeployment";

/**
 * Main Deployment Entry Point
 * 
 * This is the primary module to deploy all contracts using the two-phase approach.
 * 
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/MainDeployment.ts --network <network>
 * 
 * The deployment will:
 * 1. Deploy all library contracts
 * 2. Deploy all main contracts without cross-dependencies
 * 3. Configure all address dependencies and grant roles
 */
const MainDeploymentModule = buildModule("MainDeploymentModule", (m) => {
  // Deploy everything using the complete deployment module
  const deployment = m.useModule(CompleteDeploymentModule);
  
  return deployment;
});

export default MainDeploymentModule;
