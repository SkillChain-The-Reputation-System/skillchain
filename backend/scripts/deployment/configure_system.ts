// backend/scripts/deployment/configure_system.ts

/**
 * System Configuration Script
 * 
 * This script configures all contract addresses and roles after deployment.
 * It replicates the functionality of PhaseTwo_AddressConfiguration.ts module
 * but as a standalone script for manual execution or automation.
 * 
 * The script performs the following operations:
 * 1. Load deployed contract addresses from ignition deployments
 * 2. Configure cross-contract address dependencies
 * 3. Grant necessary roles and permissions
 * 
 * Usage:
 *   NETWORK=amoy CHAIN_ID=80002 npm run configure:system
 *   NETWORK=localhost CHAIN_ID=31337 npm run configure:system
 * 
 * Features:
 * - Automatic address loading from deployment artifacts
 * - Transaction batching with configurable delays
 * - Error handling and retry logic
 * - Progress tracking and logging
 */

import fs from "fs";
import path from "path";
import hre from "hardhat";
import { parseEther } from "viem";

const NETWORK = process.env.NETWORK || "localhost";
const CHAIN_ID = process.env.CHAIN_ID || "31337";

// Delay between transactions to prevent nonce conflicts
const TX_DELAY_MS = NETWORK === "localhost" ? 100 : 2000;

interface DeployedAddresses {
  [key: string]: string;
}

interface ContractInstances {
  reputationManager: any;
  roleManager: any;
  challengeManager: any;
  solutionManager: any;
  challengeCostManager: any;
  moderationEscrow: any;
  recruiterSubscription: any;
  recruiterDataManager: any;
  jobManager: any;
  jobApplicationManager: any;
  meetingManager: any;
}

async function loadDeployedAddresses(): Promise<DeployedAddresses> {
  const deploymentPath = path.join(
    __dirname,
    "../../ignition/deployments",
    `chain-${CHAIN_ID}`,
    "deployed_addresses.json"
  );

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}`);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("✅ Loaded deployed addresses from:", deploymentPath);
  return deployedAddresses;
}

async function getContractInstances(addresses: DeployedAddresses): Promise<ContractInstances> {
  const [signer] = await hre.viem.getWalletClients();

  const contracts = {
    reputationManager: await hre.viem.getContractAt(
      "ReputationManager",
      addresses["ReputationManagerModule#ReputationManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    roleManager: await hre.viem.getContractAt(
      "RoleManager", 
      addresses["RoleManagerModule#RoleManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    challengeManager: await hre.viem.getContractAt(
      "ChallengeManager",
      addresses["ChallengeManagerModule#ChallengeManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    solutionManager: await hre.viem.getContractAt(
      "SolutionManager",
      addresses["SolutionManagerModule#SolutionManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    challengeCostManager: await hre.viem.getContractAt(
      "ChallengeCostManager",
      addresses["ChallengeCostManagerModule#ChallengeCostManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    moderationEscrow: await hre.viem.getContractAt(
      "ModerationEscrow",
      addresses["ModerationEscrowModule#ModerationEscrow"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    recruiterSubscription: await hre.viem.getContractAt(
      "RecruiterSubscription",
      addresses["RecruiterSubscriptionModule#RecruiterSubscription"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    recruiterDataManager: await hre.viem.getContractAt(
      "RecruiterDataManager",
      addresses["RecruiterDataManagerModule#RecruiterDataManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    jobManager: await hre.viem.getContractAt(
      "JobManager",
      addresses["JobManagerModule#JobManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    jobApplicationManager: await hre.viem.getContractAt(
      "JobApplicationManager",
      addresses["JobApplicationManagerModule#JobApplicationManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
    meetingManager: await hre.viem.getContractAt(
      "MeetingManager",
      addresses["MeetingManagerModule#MeetingManager"] as `0x${string}`,
      { client: { wallet: signer } }
    ),
  };

  console.log("✅ Contract instances created successfully");
  return contracts;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeTransaction(
  description: string,
  transactionFn: () => Promise<any>
): Promise<void> {
  try {
    console.log(`🔄 ${description}...`);
    const tx = await transactionFn();
    const publicClient = await hre.viem.getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`✅ ${description} - Hash: ${receipt.transactionHash}`);
    await delay(TX_DELAY_MS);
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(error);
    throw error;
  }
}

async function configureAddressDependencies(contracts: ContractInstances): Promise<void> {
  console.log("\n📋 Phase 1: Configuring Address Dependencies\n");

  // Configure RoleManager ↔ ReputationManager
  await executeTransaction(
    "Setting ReputationManager address on RoleManager",
    () => contracts.roleManager.write.setReputationManagerAddress([contracts.reputationManager.address])
  );

  await executeTransaction(
    "Setting RoleManager address on ReputationManager", 
    () => contracts.reputationManager.write.setRoleManagerAddress([contracts.roleManager.address])
  );

  // Configure ChallengeManager dependencies
  await executeTransaction(
    "Setting ReputationManager address on ChallengeManager",
    () => contracts.challengeManager.write.setReputationManagerAddress([contracts.reputationManager.address])
  );

  await executeTransaction(
    "Setting SolutionManager address on ChallengeManager",
    () => contracts.challengeManager.write.setSolutionManagerAddress([contracts.solutionManager.address])
  );

  await executeTransaction(
    "Setting RoleManager address on ChallengeManager", 
    () => contracts.challengeManager.write.setRoleManagerAddress([contracts.roleManager.address])
  );

  await executeTransaction(
    "Setting ChallengeCostManager address on ChallengeManager",
    () => contracts.challengeManager.write.setChallengeCostManagerAddress([contracts.challengeCostManager.address])
  );

  await executeTransaction(
    "Setting ModerationEscrow address on ChallengeManager",
    () => contracts.challengeManager.write.setModerationEscrowAddress([contracts.moderationEscrow.address])
  );

  // Configure SolutionManager dependencies
  await executeTransaction(
    "Setting ChallengeManager address on SolutionManager",
    () => contracts.solutionManager.write.setChallengeManagerAddress([contracts.challengeManager.address])
  );

  await executeTransaction(
    "Setting ReputationManager address on SolutionManager",
    () => contracts.solutionManager.write.setReputationManagerAddress([contracts.reputationManager.address])
  );

  await executeTransaction(
    "Setting RoleManager address on SolutionManager",
    () => contracts.solutionManager.write.setRoleManagerAddress([contracts.roleManager.address])
  );

  // Configure ChallengeCostManager dependencies
  await executeTransaction(
    "Setting ChallengeManager address on ChallengeCostManager",
    () => contracts.challengeCostManager.write.setChallengeManagerAddress([contracts.challengeManager.address])
  );

  await executeTransaction(
    "Setting ModerationEscrow address on ChallengeCostManager",
    () => contracts.challengeCostManager.write.setModerationEscrowAddress([contracts.moderationEscrow.address])
  );

  // Configure ModerationEscrow dependencies
  await executeTransaction(
    "Setting ChallengeManager address on ModerationEscrow",
    () => contracts.moderationEscrow.write.setChallengeManagerAddress([contracts.challengeManager.address])
  );

  await executeTransaction(
    "Setting ReputationManager address on ModerationEscrow",
    () => contracts.moderationEscrow.write.setReputationManagerAddress([contracts.reputationManager.address])
  );

  // Configure recruitment-related dependencies
  await executeTransaction(
    "Setting ReputationManager address on RecruiterSubscription",
    () => contracts.recruiterSubscription.write.setReputationManagerAddress([contracts.reputationManager.address])
  );

  await executeTransaction(
    "Setting RecruiterSubscription address on RecruiterDataManager",
    () => contracts.recruiterDataManager.write.setRecruiterSubscriptionAddress([contracts.recruiterSubscription.address])
  );

  await executeTransaction(
    "Setting RecruiterSubscription address on JobManager",
    () => contracts.jobManager.write.setRecruiterSubscriptionAddress([contracts.recruiterSubscription.address])
  );

  await executeTransaction(
    "Setting JobManager address on JobApplicationManager",
    () => contracts.jobApplicationManager.write.setJobManagerAddress([contracts.jobManager.address])
  );

  await executeTransaction(
    "Setting RecruiterSubscription address on JobApplicationManager",
    () => contracts.jobApplicationManager.write.setRecruiterSubscriptionAddress([contracts.recruiterSubscription.address])
  );

  await executeTransaction(
    "Setting RecruiterSubscription address on MeetingManager",
    () => contracts.meetingManager.write.setRecruiterSubscriptionAddress([contracts.recruiterSubscription.address])
  );
}

async function grantRolesAndPermissions(contracts: ContractInstances): Promise<void> {
  console.log("\n🔑 Phase 2: Granting Roles and Permissions\n");

  // Grant reputation updater roles
  await executeTransaction(
    "Granting ReputationUpdater role to ChallengeManager",
    () => contracts.reputationManager.write.grantReputationUpdaterRole([contracts.challengeManager.address])
  );

  await executeTransaction(
    "Granting ReputationUpdater role to SolutionManager",
    () => contracts.reputationManager.write.grantReputationUpdaterRole([contracts.solutionManager.address])
  );

  // Grant challenge manager roles
  await executeTransaction(
    "Granting ChallengeManager role on ChallengeCostManager",
    () => contracts.challengeCostManager.write.grantChallengeManagerRole([contracts.challengeManager.address])
  );

  await executeTransaction(
    "Granting ChallengeManager role on ModerationEscrow",
    () => contracts.moderationEscrow.write.grantChallengeManagerRole([contracts.challengeManager.address])
  );

  // Grant job application manager role
  await executeTransaction(
    "Granting JobApplicationManager role on RecruiterSubscription",
    () => contracts.recruiterSubscription.write.grantJobApplicationManagerRole([contracts.jobApplicationManager.address])
  );
}

async function main(): Promise<void> {
  console.log("🚀 Starting System Configuration Script");
  console.log(`📡 Network: ${NETWORK}`);
  console.log(`🔗 Chain ID: ${CHAIN_ID}`);
  console.log(`⏱️  Transaction delay: ${TX_DELAY_MS}ms\n`);

  try {
    // Load deployed addresses
    const addresses = await loadDeployedAddresses();
    
    // Get contract instances
    const contracts = await getContractInstances(addresses);
    
    // Configure address dependencies
    await configureAddressDependencies(contracts);
    
    // Grant roles and permissions
    await grantRolesAndPermissions(contracts);
    
    console.log("\n🎉 System configuration completed successfully!");
    console.log("All contracts have been configured with proper addresses and permissions.");
    
  } catch (error) {
    console.error("\n💥 Configuration failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { main as configureSystem };
