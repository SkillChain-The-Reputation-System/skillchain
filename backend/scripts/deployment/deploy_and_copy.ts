// backend/scripts/deploy_and_copy.ts

/**
 * Contract Deployment Script
 * 
 * This script deploys all smart contracts to the specified network.
 * Configuration of cross-dependencies is handled separately via other scripts.
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

// List of library contracts to exclude from frontend config and artifacts
const LIBRARY_CONTRACTS = [
  "Weights",
  "ChallengeCostFormulas", 
  "RewardTokenFormulas",
  "RecruitmentFeeFormulas",
  "ReputationFormulas"
];

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
    })
    .filter((config) => !LIBRARY_CONTRACTS.includes(config.importName)); // Exclude library contracts

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
  configContent += "const NODE_ENV = process.env.NODE_ENV;\n";
  configContent += "const APP_NETWORK = process.env[\"NEXT_PUBLIC_NETWORK\"] || (NODE_ENV === 'production' ? 'amoy' : 'localhost');\n";
  configContent += "const isProduction = NODE_ENV === 'production';\n";
  configContent += "const useAmoyNetwork = APP_NETWORK === 'amoy';\n";
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
  configContent += "  APP_NETWORK,\n";
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
  console.log(`💡 The config will automatically switch networks at runtime based on NEXT_PUBLIC_NETWORK`);
}

async function validateDeploymentOrder(moduleFiles: string[]): Promise<void> {
  console.log("🔍 Validating deployment order...");
  
  // Define dependency mapping for deployment validation
  const deploymentDependencies: Record<string, string[]> = {
    "Libraries.ts": ["Weights.ts", "ChallengeCostFormulas.ts", "RewardTokenFormulas.ts", "RecruitmentFeeFormulas.ts", "ReputationFormulas.ts"],
    // All other contracts should be deployable independently
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
    const deps = deploymentDependencies[file] || [];
    for (const dep of deps) {
      const depIndex = moduleFiles.indexOf(dep);
      if (depIndex === -1) {
        validationErrors.push(`⚠️  Dependency ${dep} not found for ${file}`);
      } else if (depIndex > index) {
        validationErrors.push(`❌ Dependency violation: ${file} (position ${index + 1}) depends on ${dep} (position ${depIndex + 1})`);
      }
    }
  }
  
  if (validationErrors.length > 0) {
    console.error("\n🚨 Deployment order validation failed:");
    validationErrors.forEach(error => console.error(error));
    throw new Error("Invalid deployment order detected");
  }
  
  console.log("✅ Deployment order validation passed");
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
  console.log("🚀 Starting Contract Deployment...");
  
  // Deploy all contracts
  console.log("\n🎯 Deploying all contracts");
  console.log("=" .repeat(60));
  
  const deploymentModules = [
    // Layer 1: Pure libraries (no dependencies)
    "Weights.ts",
    "ChallengeCostFormulas.ts", 
    "RewardTokenFormulas.ts",
    "RecruitmentFeeFormulas.ts",
    "ReputationFormulas.ts",
    
    // Layer 2: Library aggregator and standalone contracts
    "Libraries.ts",
    "UserDataManager.ts",
    
    // Layer 3: Core contracts
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
    .filter((f) => f.match(/\.(js|ts)$/));
  
  // Use deployment order for existing files
  const moduleFiles = deploymentModules.filter(file => allModuleFiles.includes(file));

  console.log(`📋 Deployment order (${moduleFiles.length} modules):`);
  moduleFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log("");
  
  // Validate deployment order
  await validateDeploymentOrder(moduleFiles);

  // Use batch size of 1 for real testnets (like Amoy), larger for localhost
  const batchSize = (NETWORK === "amoy" || NETWORK === "polygon" || NETWORK === "mainnet") ? 1 : 3;
  
  // Deploy all contracts
  for (let i = 0; i < moduleFiles.length; i += batchSize) {
    const batch = moduleFiles.slice(i, i + batchSize);
    const batchNumber = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(moduleFiles.length/batchSize);
    
    console.log(`\n📦 Deploying batch ${batchNumber}/${totalBatches}: [${batch.join(', ')}]`);
    
    for (const file of batch) {
      const modulePath = path.join(modulesDir, file);
      const relativePath = path.relative(process.cwd(), modulePath);
      const contractName = path.basename(file, path.extname(file));
      
      console.log(`\n⚡ [${batchNumber}/${totalBatches}] Deploying ${file}...`);
      
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
            console.error(`❌ Failed to deploy ${file} even after retry. This may cause issues later.`);
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

  console.log(`Ensuring output folder exists at ${outputDir}...`);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("- Copying ABI files:");

  for (const contractName of contractNames) {
    // Skip library contracts
    if (LIBRARY_CONTRACTS.includes(contractName)) {
      console.log(`${contractName}.json skipped (library contract)`);
      continue;
    }

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
  console.log(`\n🎉 Deployment Summary for ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log("=" .repeat(70));
  console.log(`📊 Successfully deployed ${contractNames.length}/${moduleFiles.length} contracts:`);
  contractNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
  });
  
  if (contractNames.length < moduleFiles.length) {
    const failedContracts = moduleFiles
      .map((f: string) => path.basename(f, path.extname(f)))
      .filter((name: string) => !contractNames.includes(name));
    console.log(`\n⚠️  Failed deployments (${failedContracts.length}):`);
    failedContracts.forEach((name: string, index: number) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }
  
  console.log(`\n🌐 Network: ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log(`📁 Config file: ${contractsConfigPath}`);
  console.log(`🔄 The config will automatically switch networks at runtime based on NEXT_PUBLIC_NETWORK`);
  console.log(`💡 Use separate configuration scripts to set up contract dependencies and roles`);

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
