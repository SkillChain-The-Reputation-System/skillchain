// backend/scripts/deploy_and_copy.ts

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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
  const contractNames: string[] = []

  console.log("Deploying Ignition modules…");
  for (const file of fs
    .readdirSync(modulesDir)
    .filter((f) => f.match(/\.(js|ts)$/))
  ) {
    const modulePath = path.join(modulesDir, file);
    const relativePath = path.relative(process.cwd(), modulePath);
    console.log(`>> Deploying ${file}`);
    execSync(
      `npx hardhat ignition deploy ${relativePath} --network localhost`,
      { stdio: "inherit" }
    );

    contractNames.push(path.basename(file, path.extname(file)))
  }

  console.log(`Ensuring output folder exists at ${outputDir}...`);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("- Copying ABI files:");

  for (const contractName of contractNames) {
    const contractDir = path.join(artifactDir, `${contractName}.sol`);
    const abiFilePath = path.join(contractDir, `${contractName}.json`);

    if (!fs.existsSync(abiFilePath)) {
      console.error(`! ABI file not found for ${contractName} at ${abiFilePath}`);
      continue;
    }

    fs.copyFileSync(
      abiFilePath,
      path.join(outputDir, `${contractName}.json`)
    )
    console.log(`${contractName}.json copied`)
  }
  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
