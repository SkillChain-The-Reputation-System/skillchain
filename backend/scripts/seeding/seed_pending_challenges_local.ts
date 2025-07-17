import hre from "hardhat";
import ChallengeManagerArtifact from "../../artifacts/contracts/ChallengeManager.sol/ChallengeManager.json";
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface PendingChallengeData {
  contributor: string;
  challenge_txid: string;
  category: number;
  timestamp: number;
  status: number;
  quality_score: number;
  difficulty_level: number;
  solve_time: number;
}

const abi = ChallengeManagerArtifact.abi;
const deploymentPath = path.resolve(
  __dirname,
  '../../ignition/deployments/chain-31337/deployed_addresses.json'
);

if (!fs.existsSync(deploymentPath)) {
  throw new Error(`Deployment file not found: ${deploymentPath}`);
}

const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const contractAddress: `0x${string}` =
  deployedAddresses["ChallengeManagerModule#ChallengeManager"];

const csvPath = path.resolve(__dirname, '../data/pending-challenges.csv');

async function seedPendingChallenges() {
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    return;
  }

  const publicClient = await hre.viem.getPublicClient();
  const [ownerClient] = await hre.viem.getWalletClients();

  console.log(`Reading CSV from: ${csvPath}`);
  const pendingChallengeDataFile = fs.readFileSync(csvPath, 'utf8');

  const parsed = Papa.parse<PendingChallengeData>(pendingChallengeDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const pendingChallenges = parsed.data;

  for (const [index, challenge] of pendingChallenges.entries()) {
    const values = Object.values(challenge) as Array<string | number | undefined>;
    const hasEmptyField = values.some((v) => v === '' || v === undefined || v === null);
    if (hasEmptyField) {
      console.warn(`Skipping row ${index + 1} due to empty fields`);
      continue;
    }

    try {
      console.log(`Processing pending challenge ${index + 1}/${pendingChallenges.length}`);

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: 'seedChallenge',
        args: [
          challenge.contributor,
          challenge.challenge_txid,
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

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    } catch (error) {
      console.error(`Error processing pending challenge ${index + 1}:`, error);
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
