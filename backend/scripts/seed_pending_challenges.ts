// filepath: d:\Hai_Tuyen\thesis\skillchain\backend\scripts\seed_pending_challenges.ts
import hre from "hardhat";
import ChallengeManagerArtifact from '../artifacts/contracts/ChallengeManager.sol/ChallengeManager.json'
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface PendingChallengeData {
  contributor: string;
  title_url: string;
  description_url: string;
  category: number;
  timestamp: number;
  status: number;
  quality_score: number; 
  difficulty_level: number; 
  solve_time: number;
}

const abi = ChallengeManagerArtifact.abi;
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Ensure this is the correct deployed address of your ChallengeManager

const csvPath = path.resolve(__dirname, 'pending-challenges.csv');

async function seedPendingChallenges() {
  const publicClient = await hre.viem.getPublicClient();
  const [ownerClient] = await hre.viem.getWalletClients(); // account #0 of hardhat network

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    return;
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const pendingChallengeDataFile = fs.readFileSync(csvPath, 'utf8');

  const parsed = Papa.parse<PendingChallengeData>(pendingChallengeDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const pendingChallenges = parsed.data;

  for (const [index, challenge] of pendingChallenges.entries()) {
    try {
      console.log(`Processing pending challenge ${index + 1}/${pendingChallenges.length}`);

        // Send transaction to add challenge
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: abi,
        functionName: 'seedChallenge',
        args: [
          challenge.contributor,
          challenge.title_url,
          challenge.category,
          challenge.timestamp,
          challenge.status,
          challenge.quality_score,
          challenge.difficulty_level,
          challenge.solve_time,
        ],
      });

      const txHash = await ownerClient.writeContract(request);

      console.log(`Transaction sent: ${txHash}`);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    } catch (error) {
      console.error(`Error processing pending challenge ${index + 1}:`, error);
      // Consider if you want to continue with other entries or stop on error
    }
  }
}

async function main() {
  await seedPendingChallenges();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
