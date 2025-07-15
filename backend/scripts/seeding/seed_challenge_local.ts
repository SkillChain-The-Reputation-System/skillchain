import hre from "hardhat";
import ChallengeManagerArtifact from '../../artifacts/contracts/ChallengeManager.sol/ChallengeManager.json'
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface ChallengeData {
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
  deployedAddresses['ChallengeManagerModule#ChallengeManager'];

const csvPath = path.resolve(__dirname, '../data/challenge.csv');

async function seedChallenge() {
  const publicClient = await hre.viem.getPublicClient();
  const [ownerClient] = await hre.viem.getWalletClients(); // account #0 of hardhat network

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    return;
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const challengeDataFile = fs.readFileSync(csvPath, 'utf8');

  const parsed = Papa.parse<ChallengeData>(challengeDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const challenges = parsed.data;

  for (const [index, challenge] of challenges.entries()) {
    try {
      console.log(`Processing challenge ${index + 1}/${challenges.length}`);
      console.log(`Contributor: ${challenge.contributor}`);

      // Send transaction to add challenge
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: abi,
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

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    } catch (error) {
      console.error(`Error processing challenge ${index + 1}:`, error);
    }
  }
}

async function main() {
  await seedChallenge();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });