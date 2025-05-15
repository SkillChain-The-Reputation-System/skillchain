// backend/scripts/deploy_and_copy.ts

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { viem } from "hardhat";

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
  }

  console.log(`Ensuring output folder exists at ${outputDir}…`);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log("Copying ABI files:");

  fs.copyFileSync(
    path.join(artifactDir, "UserDataManager.sol", "UserDataManager.json"),
    path.join(outputDir, "UserDataManager.json")
  );
  console.log(">>UserDataManager.json copied");

  fs.copyFileSync(
    path.join(artifactDir, "ChallengeManager.sol", "ChallengeManager.json"),
    path.join(outputDir, "ChallengeManager.json")
  );
  console.log(">>ChallengeManager.json copied");

  fs.copyFileSync(
    path.join(artifactDir, "SolutionManager.sol", "SolutionManager.json"),
    path.join(outputDir, "SolutionManager.json")
  );
  console.log(">>SolutionManager.json copied");

  fs.copyFileSync(
    path.join(artifactDir, "ReputationManager.sol", "ReputationManager.json"),
    path.join(outputDir, "ReputationManager.json")
  );
  console.log(">>ReputationManager.json copied");

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
