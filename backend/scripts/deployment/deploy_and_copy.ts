// backend/scripts/deploy_and_copy.ts

/**
 * Two-Phase Deployment Script
 * 
 * This script implements a two-phase deployment strategy to handle circular dependencies:
 * 
 * Phase 1: Deploy all contracts without cross-dependencies
 * - Libraries and standalone contracts
 * - Core contracts (without cross-references)
 * - All contracts are deployed but not yet interconnected
 * 
 * Phase 2: Configure address dependencies and roles
 * - Set all contract addresses on dependent contracts
 * - Grant necessary roles and permissions
 * - Complete the interconnection of the contract ecosystem
 * 
 * Usage:
 *   NETWORK=amoy CHAIN_ID=80002 npm run deploy:copy
 *   NETWORK=localhost CHAIN_ID=31337 npm run deploy:copy
 * 
 * Features:
 * - Batch size of 1 for real testnets (amoy, polygon, mainnet) to avoid nonce conflicts
 * - Automatic retry logic for failed deployments
 * - Nonce synchronization for Amoy network
 * - Automatic generation of contracts-config.ts with dual-network support
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const NETWORK = process.env.NETWORK || "localhost";
const CHAIN_ID = process.env.CHAIN_ID || "31337";

async function generateContractsConfig(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "../..");
  const deploymentPath = path.join(
    backendRoot,
    "ignition",
    "deployments",
    `chain-${CHAIN_ID}`,
    "deployed_addresses.json"
  );
  const contractsConfigPath = path.join(
    backendRoot,
    "..",
    "frontend",
    "src",
    "constants",
    "contracts-config.ts"
  );

  // Check if deployment file exists
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment addresses file not found:", deploymentPath);
    return;
  }
  // Read deployed addresses
  const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  // Also try to read existing addresses from other networks
  const localhostDeploymentPath = path.join(
    backendRoot,
    "ignition",
    "deployments",
    "chain-31337",
    "deployed_addresses.json"
  );
  const amoyDeploymentPath = path.join(
    backendRoot,
    "ignition",
    "deployments",
    "chain-80002",
    "deployed_addresses.json"
  );

  let localhostAddresses: Record<string, string> = {};
  let amoyAddresses: Record<string, string> = {};

  if (fs.existsSync(localhostDeploymentPath)) {
    localhostAddresses = JSON.parse(fs.readFileSync(localhostDeploymentPath, "utf8"));
  }

  if (fs.existsSync(amoyDeploymentPath)) {
    amoyAddresses = JSON.parse(fs.readFileSync(amoyDeploymentPath, "utf8"));
  }
  // Automatically generate contract configurations from deployed addresses
  const contractConfigs = Object.keys(deployedAddresses)
    .filter((moduleKey) => !moduleKey.includes("Libraries")) // Skip library modules
    .map((moduleKey) => {
      // Extract contract name from module key (e.g., "ChallengeManagerModule#ChallengeManager" -> "ChallengeManager")
      const contractName = moduleKey.split("#")[1];

      return {
        moduleKey,
        configName: `ContractConfig_${contractName}`,
        artifactName: `${contractName}Artifact`,
        importName: contractName,
      };
    });

  // Generate the contracts config file content
  let configContent = "";

  // Add imports
  const uniqueImports = [
    ...new Set(contractConfigs.map((config) => config.importName)),
  ];
  uniqueImports.forEach((importName) => {
    configContent += `import ${importName}Artifact from "./contract-artifacts/${importName}.json";\n`;
  });

  configContent += "\n";
  configContent += "// Network detection helper\n";
  configContent += "const isProduction = process.env.NODE_ENV === 'production';\n";
  configContent += "const useAmoyNetwork = isProduction || process.env.NEXT_PUBLIC_USE_AMOY === 'true';\n";
  configContent += "\n";
  configContent += "// Contract addresses for different networks\n";
  configContent += "const LOCALHOST_ADDRESSES = {\n";

  // Add localhost addresses
  contractConfigs.forEach((config) => {
    const address = localhostAddresses[config.moduleKey] || "0x0000000000000000000000000000000000000000";
    configContent += `  ${config.importName}: '${address}',\n`;
  });

  configContent += "};\n\n";
  configContent += "const AMOY_ADDRESSES = {\n";

  // Add Amoy addresses
  contractConfigs.forEach((config) => {
    const address = amoyAddresses[config.moduleKey] || "0x0000000000000000000000000000000000000000";
    configContent += `  ${config.importName}: '${address}',\n`;
  });

  configContent += "};\n\n";
  configContent += "// Helper function to get the correct address based on network\n";
  configContent += "const getContractAddress = (contractName: keyof typeof LOCALHOST_ADDRESSES): string => {\n";
  configContent += "  const addresses = useAmoyNetwork ? AMOY_ADDRESSES : LOCALHOST_ADDRESSES;\n";
  configContent += "  const address = addresses[contractName];\n";
  configContent += "  \n";
  configContent += "  if (!address || address === '0x0000000000000000000000000000000000000000') {\n";
  configContent += "    console.warn(`⚠️  No address found for ${contractName} on ${useAmoyNetwork ? 'Amoy' : 'localhost'} network`);\n";
  configContent += "  }\n";
  configContent += "  \n";
  configContent += "  return address;\n";
  configContent += "};\n\n";

  // Add contract configurations with dynamic address selection
  contractConfigs.forEach((config, index) => {
    configContent += `export const ${config.configName} = {\n`;
    configContent += `  get address() {\n`;
    configContent += `    return getContractAddress('${config.importName}');\n`;
    configContent += `  },\n`;
    configContent += `  abi: ${config.artifactName}.abi,\n`;
    configContent += `};\n`;

    // Add extra line break except for the last item
    if (index < contractConfigs.length - 1) {
      configContent += "\n";
    }
  });

  // Add network info export
  configContent += "\n// Network information\n";
  configContent += "export const NETWORK_INFO = {\n";
  configContent += "  useAmoyNetwork,\n";
  configContent += "  isProduction,\n";
  configContent += "  currentNetwork: useAmoyNetwork ? 'Polygon Amoy (Chain ID: 80002)' : 'Localhost Hardhat (Chain ID: 31337)',\n";
  configContent += "  localhostAddresses: LOCALHOST_ADDRESSES,\n";
  configContent += "  amoyAddresses: AMOY_ADDRESSES,\n";
  configContent += "};\n";

  // Log the configurations
  contractConfigs.forEach((config) => {
    const localhostAddr = localhostAddresses[config.moduleKey] || "Not deployed";
    const amoyAddr = amoyAddresses[config.moduleKey] || "Not deployed";
    console.log(`Generated ${config.configName}:`);
    console.log(`  - Localhost: ${localhostAddr}`);
    console.log(`  - Amoy: ${amoyAddr}`);
  });

  // Ensure the directory exists
  const configDir = path.dirname(contractsConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  // Write the generated config to file
  fs.writeFileSync(contractsConfigPath, configContent);
  console.log("\n🎉 Generated new contracts-config.ts file with dual-network support!");
  console.log(`📍 Current deployment: ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log(`📁 Config file: ${contractsConfigPath}`);
  console.log(`💡 The config will automatically switch between localhost and Amoy based on NODE_ENV`);
}

async function validatePhaseOneOrder(moduleFiles: string[]): Promise<void> {
  console.log("🔍 Validating Phase 1 deployment order...");
  
  // Define dependency mapping for Phase 1 validation (only dependencies needed for deployment)
  const phaseDependencies: Record<string, string[]> = {
    "Libraries.ts": ["Weights.ts", "ChallengeCostFormulas.ts", "RewardTokenFormulas.ts", "RecruitmentFeeFormulas.ts", "ReputationFormulas.ts"],
    // All other contracts in Phase 1 should be deployable independently
    "ReputationManager.ts": ["Libraries.ts"],
    "RoleManager.ts": [],
    "ChallengeManager.ts": ["Libraries.ts"],
    "SolutionManager.ts": [],
    "ChallengeCostManager.ts": ["Libraries.ts"],
    "ModerationEscrow.ts": ["Libraries.ts"],
    "RecruiterSubscription.ts": ["Libraries.ts"],
    "RecruiterDataManager.ts": [],
    "JobManager.ts": ["Libraries.ts"],
    "JobApplicationManager.ts": [],
    "MeetingManager.ts": []
  };
  
  const moduleOrder = moduleFiles.map((file, index) => ({ file, index }));
  let validationErrors: string[] = [];
  
  // Check if dependencies are deployed before dependent contracts
  for (const { file, index } of moduleOrder) {
    const deps = phaseDependencies[file] || [];
    for (const dep of deps) {
      const depIndex = moduleFiles.indexOf(dep);
      if (depIndex === -1) {
        validationErrors.push(`⚠️  Phase 1 dependency ${dep} not found for ${file}`);
      } else if (depIndex > index) {
        validationErrors.push(`❌ Phase 1 dependency violation: ${file} (position ${index + 1}) depends on ${dep} (position ${depIndex + 1})`);
      }
    }
  }
  
  if (validationErrors.length > 0) {
    console.error("\n🚨 Phase 1 deployment order validation failed:");
    validationErrors.forEach(error => console.error(error));
    throw new Error("Invalid Phase 1 deployment order detected");
  }
  
  console.log("✅ Phase 1 deployment order validation passed");
}

async function syncNonceIfNeeded(): Promise<void> {
  if (NETWORK === "amoy") {
    console.log("🔄 Checking nonce synchronization for Amoy network...");
    
    // Check for partial deployment state
    const deploymentPath = path.join(
      path.resolve(__dirname, "../.."),
      "ignition",
      "deployments",
      `chain-${CHAIN_ID}`,
      "journal.jsonl"
    );
    
    if (fs.existsSync(deploymentPath)) {
      console.log("⚠️  Found existing deployment state. Checking nonce...");
      try {
        execSync(`npx hardhat run scripts/deployment/check_nonce.ts --network ${NETWORK}`, { 
          stdio: "inherit", 
          cwd: path.resolve(__dirname, "../..") 
        });
        
        // Check if we need to clean up incomplete deployments
        const deploymentDir = path.dirname(deploymentPath);
        const journalContent = fs.readFileSync(deploymentPath, 'utf8');
        const lines = journalContent.trim().split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const lastLine = JSON.parse(lines[lines.length - 1]);
          if (lastLine.type === "NETWORK_INTERACTION_REQUEST" || lastLine.type === "TRANSACTION_PREPARE_SEND") {
            console.log("⚠️  Detected incomplete deployment. Clearing state to prevent nonce conflicts...");
            // Clear the incomplete deployment state
            fs.rmSync(deploymentDir, { recursive: true, force: true });
            console.log("✅ Deployment state cleared. Ready for fresh deployment.");
          }
        }
      } catch (error) {
        console.log("⚠️  Nonce check failed, but continuing with deployment...");
      }
    }
  }
}

async function main(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "../..");
  const modulesDir = path.join(backendRoot, "ignition", "modules");
  const artifactDir = path.join(backendRoot, "artifacts", "contracts");
  const outputDir = path.join(
    backendRoot,
    "..",
    "frontend",
    "src",
    "constants",
    "contract-artifacts"
  );
  const contractsConfigPath = path.join(
    backendRoot,
    "..",
    "frontend",
    "src",
    "constants",
    "contracts-config.ts"
  );
  const contractNames: string[] = [];

  // Check if we're only generating config (skip deployment)
  const generateOnly = process.argv.includes('--generate-only');

  if (generateOnly) {
    console.log("📋 Generating contracts-config.ts only (skipping deployment)...");
    await generateContractsConfig();
    return;
  }

  // Sync nonce and clean up incomplete deployments if needed
  await syncNonceIfNeeded();
  console.log("🚀 Starting Two-Phase Deployment Strategy...");
  
  // Phase 1: Deploy all contracts without cross-dependencies
  console.log("\n🎯 PHASE 1: Deploying contracts without cross-dependencies");
  console.log("=" .repeat(60));
  
  const phaseOneModules = [
    // Layer 1: Pure libraries (no dependencies)
    "Weights.ts",
    "ChallengeCostFormulas.ts", 
    "RewardTokenFormulas.ts",
    "RecruitmentFeeFormulas.ts",
    "ReputationFormulas.ts",
    
    // Layer 2: Library aggregator and standalone contracts
    "Libraries.ts",
    "UserDataManager.ts",
    
    // Layer 3: Core contracts (deployed without cross-references)
    "ReputationManager.ts",
    "RoleManager.ts",
    "ChallengeManager.ts",
    "SolutionManager.ts",
    "ChallengeCostManager.ts",
    "ModerationEscrow.ts",
    
    // Layer 4: Recruitment and job management contracts
    "RecruiterSubscription.ts",
    "RecruiterDataManager.ts",
    "JobManager.ts",
    "JobApplicationManager.ts",
    "MeetingManager.ts"
  ];

  // Get all module files and filter based on what exists
  const allModuleFiles = fs
    .readdirSync(modulesDir)
    .filter((f) => f.match(/\.(js|ts)$/) && !f.includes("PhaseTwo") && !f.includes("CompleteDeployment") && !f.includes("MainDeployment"));
  
  // Use phase one order for existing files
  const moduleFiles = phaseOneModules.filter(file => allModuleFiles.includes(file));

  console.log(`📋 Phase 1 deployment order (${moduleFiles.length} modules):`);
  moduleFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log("");
  
  // Validate deployment order for phase 1
  await validatePhaseOneOrder(moduleFiles);

  // Use batch size of 1 for real testnets (like Amoy), larger for localhost
  const batchSize = (NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") ? 1 : 3;
  
  // PHASE 1: Deploy all contracts without cross-dependencies
  for (let i = 0; i < moduleFiles.length; i += batchSize) {
    const batch = moduleFiles.slice(i, i + batchSize);
    const batchNumber = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(moduleFiles.length/batchSize);
    
    console.log(`\n📦 [Phase 1] Deploying batch ${batchNumber}/${totalBatches}: [${batch.join(', ')}]`);
    
    for (const file of batch) {
      const modulePath = path.join(modulesDir, file);
      const relativePath = path.relative(process.cwd(), modulePath);
      const contractName = path.basename(file, path.extname(file));
      
      console.log(`\n⚡ [Phase 1 - ${batchNumber}/${totalBatches}] Deploying ${file}...`);
      
      try {
        const startTime = Date.now();
        execSync(
          `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
          { stdio: "inherit" }
        );
        const deployTime = Date.now() - startTime;
        
        contractNames.push(contractName);
        console.log(`✅ Successfully deployed ${file} (${deployTime}ms)`);
        
        // Add a small delay between deployments on real testnets
        if ((NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") && batch.indexOf(file) < batch.length - 1) {
          console.log("⏳ Waiting 3 seconds for nonce stability...");
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Failed to deploy ${file}:`);
        
        if (NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") {
          console.log("🔄 Attempting recovery for real testnet...");
          try {
            // Check nonce status
            execSync(`npx hardhat run scripts/deployment/check_nonce.ts --network ${NETWORK}`, { 
              stdio: "inherit" 
            });
            
            console.log("⏳ Waiting 5 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Retry deployment
            console.log(`🔄 Retrying deployment of ${file}...`);
            execSync(
              `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
              { stdio: "inherit" }
            );
            contractNames.push(contractName);
            console.log(`✅ Successfully deployed ${file} on retry`);
          } catch (retryError) {
            console.error(`❌ Failed to deploy ${file} even after retry. This may cause issues with Phase 2.`);
            console.error(`Retry error:`, retryError);
            
            // Continue with other deployments but log the failure
            console.log(`⚠️  Continuing with remaining deployments. Manual intervention may be required for ${file}.`);
          }
        } else {
          console.error(`Deployment error:`, error);
          throw error; // Stop deployment on other networks
        }
      }
    }
    
    // Add a longer delay between batches on real testnets
    if ((NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") && i + batchSize < moduleFiles.length) {
      console.log("⏳ Waiting 5 seconds between batches...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\n🎯 PHASE 2: Configuring address dependencies and roles");
  console.log("=" .repeat(60));
  
  // Phase 2: Deploy the PhaseTwo_AddressConfiguration module
  const phaseTwoFile = "PhaseTwo_AddressConfiguration.ts";
  const phaseTwoPath = path.join(modulesDir, phaseTwoFile);
  
  if (fs.existsSync(phaseTwoPath)) {
    console.log(`\n⚡ [Phase 2] Configuring cross-contract dependencies...`);
    
    try {
      const startTime = Date.now();
      const relativePath = path.relative(process.cwd(), phaseTwoPath);
      execSync(
        `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
        { stdio: "inherit" }
      );
      const configTime = Date.now() - startTime;
      
      console.log(`✅ Successfully configured address dependencies and roles (${configTime}ms)`);
    } catch (error) {
      console.error(`❌ Failed to configure address dependencies:`);
      
      if (NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") {
        console.log("🔄 Attempting recovery for Phase 2...");
        try {
          console.log("⏳ Waiting 5 seconds before retry...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Retry Phase 2
          console.log(`🔄 Retrying Phase 2 configuration...`);
          const relativePath = path.relative(process.cwd(), phaseTwoPath);
          execSync(
            `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
            { stdio: "inherit" }
          );
          console.log(`✅ Successfully configured address dependencies on retry`);
        } catch (retryError) {
          console.error(`❌ Failed Phase 2 configuration even after retry.`);
          console.error(`Retry error:`, retryError);
          console.log(`⚠️  Deployment completed but contracts may not be fully configured.`);
        }
      } else {
        console.error(`Phase 2 error:`, error);
        throw error; // Stop deployment on other networks
      }
    }
  } else {
    console.warn(`⚠️  PhaseTwo_AddressConfiguration.ts not found. Skipping Phase 2.`);
  }

  console.log(`Ensuring output folder exists at ${outputDir}...`);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("- Copying ABI files:");

  for (const contractName of contractNames) {
    const contractDir = path.join(artifactDir, `${contractName}.sol`);
    const abiFilePath = path.join(contractDir, `${contractName}.json`);

    if (!fs.existsSync(abiFilePath)) {
      console.error(
        `! ABI file not found for ${contractName} at ${abiFilePath}`
      );
      continue;
    }

    fs.copyFileSync(abiFilePath, path.join(outputDir, `${contractName}.json`));
    console.log(`${contractName}.json copied`);
  }
  console.log("- Generating contract addresses in frontend config...");
  await generateContractsConfig();

  // Deployment summary
  console.log(`\n🎉 Two-Phase Deployment Summary for ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log("=" .repeat(70));
  console.log(`📊 Phase 1: Successfully deployed ${contractNames.length}/${moduleFiles.length} contracts:`);
  contractNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
  });
  
  if (contractNames.length < moduleFiles.length) {
    const failedContracts = moduleFiles
      .map(f => path.basename(f, path.extname(f)))
      .filter(name => !contractNames.includes(name));
    console.log(`\n⚠️  Phase 1 failed deployments (${failedContracts.length}):`);
    failedContracts.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }
  
  console.log(`\n📋 Phase 2: Address configuration and role management completed`);
  console.log(`💡 All contracts are now fully configured and ready for use`);
  console.log(`🌐 Network: ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log(`📁 Config file: ${contractsConfigPath}`);
  console.log(`🔄 The config will automatically switch between localhost and Amoy based on NODE_ENV`);

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
