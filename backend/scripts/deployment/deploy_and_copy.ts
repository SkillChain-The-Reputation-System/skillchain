// backend/scripts/deploy_and_copy.ts

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
  console.log("Deploying Ignition modules…");
  
  // Get all module files
  const moduleFiles = fs
    .readdirSync(modulesDir)
    .filter((f) => f.match(/\.(js|ts)$/))
    .sort(); // Sort to ensure consistent order

  // Deploy in smaller batches to avoid nonce conflicts on Amoy
  const batchSize = NETWORK === "amoy" ? 3 : moduleFiles.length; // Smaller batches for Amoy
  
  for (let i = 0; i < moduleFiles.length; i += batchSize) {
    const batch = moduleFiles.slice(i, i + batchSize);
    console.log(`\n📦 Deploying batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(moduleFiles.length/batchSize)}: [${batch.join(', ')}]`);
    
    for (const file of batch) {
      const modulePath = path.join(modulesDir, file);
      const relativePath = path.relative(process.cwd(), modulePath);
      console.log(`>> Deploying ${file}`);
      
      try {
        execSync(
          `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
          { stdio: "inherit" }
        );
        contractNames.push(path.basename(file, path.extname(file)));
        console.log(`✅ Successfully deployed ${file}`);
        
        // Add a small delay between deployments on Amoy to ensure nonce stability
        if (NETWORK === "amoy") {
          console.log("⏳ Waiting 2 seconds for nonce stability...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Failed to deploy ${file}:`, error);
        
        if (NETWORK === "amoy") {
          console.log("🔄 Checking nonce and retrying...");
          try {
            execSync(`npx hardhat run scripts/deployment/check_nonce.ts --network ${NETWORK}`, { stdio: "inherit" });
            console.log("⏳ Waiting 5 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Retry once
            execSync(
              `npx hardhat ignition deploy ${relativePath} --network ${NETWORK}`,
              { stdio: "inherit" }
            );
            contractNames.push(path.basename(file, path.extname(file)));
            console.log(`✅ Successfully deployed ${file} on retry`);
          } catch (retryError) {
            console.error(`❌ Failed to deploy ${file} even after retry:`, retryError);
            throw retryError;
          }
        } else {
          throw error;
        }
      }
    }
    
    // Add a longer delay between batches on Amoy
    if (NETWORK === "amoy" && i + batchSize < moduleFiles.length) {
      console.log("⏳ Waiting 5 seconds between batches...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
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

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
