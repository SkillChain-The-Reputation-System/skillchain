// Script to clean up partial deployment state that causes nonce issues
import fs from "fs";
import path from "path";

const NETWORK = process.env.NETWORK || "localhost";
const CHAIN_ID = process.env.CHAIN_ID || "31337";

async function cleanDeploymentState(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "..");
  const deploymentPath = path.join(
    backendRoot,
    "ignition",
    "deployments",
    `chain-${CHAIN_ID}`
  );

  console.log(`🧹 Cleaning deployment state for ${NETWORK} (Chain ID: ${CHAIN_ID})`);
  console.log(`📁 Deployment path: ${deploymentPath}`);

  if (fs.existsSync(deploymentPath)) {
    try {
      // Backup current state before cleaning
      const backupPath = `${deploymentPath}_backup_${new Date().toISOString().replace(/[:.]/g, '-')}`;
      fs.renameSync(deploymentPath, backupPath);
      console.log(`💾 Backed up existing state to: ${backupPath}`);
      
      console.log("✅ Deployment state cleaned successfully!");
      console.log("🚀 You can now run deployment without nonce conflicts.");
    } catch (error) {
      console.error("❌ Error cleaning deployment state:", error);
      process.exit(1);
    }
  } else {
    console.log("ℹ️  No existing deployment state found. Nothing to clean.");
  }
}

cleanDeploymentState().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
