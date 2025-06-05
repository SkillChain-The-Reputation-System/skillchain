// backend/scripts/deploy_and_copy.ts

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function generateContractsConfig(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "..");
  const deploymentPath = path.join(
    backendRoot,
    "ignition",
    "deployments",
    "chain-31337",
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

  configContent += "\n\n";

  // Add contract configurations
  contractConfigs.forEach((config, index) => {
    const address =
      deployedAddresses[config.moduleKey] ||
      "0x0000000000000000000000000000000000000000";

    configContent += `export const ${config.configName} = {\n`;
    configContent += `    address: '${address}', // Change this every time you deploy the contract\n`;
    configContent += `    abi: ${config.artifactName}.abi,\n`;
    configContent += `};\n`;

    // Add extra line break except for the last item
    if (index < contractConfigs.length - 1) {
      configContent += "\n";
    }

    console.log(`Generated ${config.configName} with address: ${address}`);
  });

  // Ensure the directory exists
  const configDir = path.dirname(contractsConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write the generated config to file
  fs.writeFileSync(contractsConfigPath, configContent);
  console.log("Generated new contracts-config.ts file");
}

async function main(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "..");
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

  console.log("Deploying Ignition modules…");
  for (const file of fs
    .readdirSync(modulesDir)
    .filter((f) => f.match(/\.(js|ts)$/))) {
    const modulePath = path.join(modulesDir, file);
    const relativePath = path.relative(process.cwd(), modulePath);
    console.log(`>> Deploying ${file}`);
    execSync(
      `npx hardhat ignition deploy ${relativePath} --network localhost`,
      { stdio: "inherit" }
    );

    contractNames.push(path.basename(file, path.extname(file)));
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
