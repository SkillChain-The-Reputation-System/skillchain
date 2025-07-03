// Script to clean up partial deployment state that causes nonce issues
import fs from "fs";
import path from "path";

const NETWORK = process.env.NETWORK || "amoy";
const CHAIN_ID = process.env.CHAIN_ID || "80002";

async function cleanDeploymentState(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "../..");
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
      // First, check what's in the deployment state
      const journalPath = path.join(deploymentPath, "journal.jsonl");
      if (fs.existsSync(journalPath)) {
        const content = fs.readFileSync(journalPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        console.log(`📊 Found ${lines.length} journal entries`);
        
        if (lines.length > 0) {
          // Analyze the last few entries
          const lastEntries = lines.slice(-3);
          let hasPendingTransactions = false;
          
          for (const line of lastEntries) {
            try {
              const entry = JSON.parse(line);
              console.log(`   Last entry type: ${entry.type}`);
              if (entry.type === "TRANSACTION_PREPARE_SEND" || 
                  entry.type === "NETWORK_INTERACTION_REQUEST") {
                hasPendingTransactions = true;
              }
            } catch (e) {
              console.log(`   Malformed entry: ${line.substring(0, 100)}...`);
            }
          }
          
          if (hasPendingTransactions) {
            console.log("⚠️  Found pending transactions - cleaning is recommended");
          } else {
            console.log("✅ No pending transactions found");
          }
        }
      }
      
      // Create backup with more detailed timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${deploymentPath}_backup_${timestamp}`;
      
      console.log("💾 Creating backup...");
      fs.renameSync(deploymentPath, backupPath);
      console.log(`✅ Backed up existing state to: ${backupPath}`);
      
      console.log("🎉 Deployment state cleaned successfully!");
    } catch (error) {
      console.error("❌ Error cleaning deployment state:", error);
      process.exit(1);
    }
  } else {
    console.log("ℹ️  No existing deployment state found. Nothing to clean.");
    console.log("✅ You can proceed with a fresh deployment.");
  }
}

cleanDeploymentState().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
