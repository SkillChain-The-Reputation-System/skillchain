import hre from "hardhat";
import UserDataManagerArtifact from '../../artifacts/contracts/UserDataManager.sol/UserDataManager.json';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface UserProfileData {
  address: string;
  txid: string;
}

const csvPath = path.resolve(__dirname, '../data/user_profiles_id_only.csv');
const deploymentPath = path.resolve(
  __dirname,
  '../../ignition/deployments/chain-31337/deployed_addresses.json'
);

if (!fs.existsSync(deploymentPath)) {
  throw new Error(`Deployment file not found: ${deploymentPath}`);
}

const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const contractAddress: `0x${string}` =
  deployedAddresses['UserDataManagerModule#UserDataManager'];

async function seedUserProfiles() {
  const publicClient = await hre.viem.getPublicClient();
  const walletClients = await hre.viem.getWalletClients();

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<UserProfileData>(csvData, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const profiles = parsed.data;

  for (const [index, profile] of profiles.entries()) {
    try {
      const walletClient = walletClients.find(
        (client) => client.account.address.toLowerCase() === profile.address.toLowerCase()
      );

      if (!walletClient) {
        console.warn(`Wallet client not found for address: ${profile.address}`);
        continue;
      }

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: UserDataManagerArtifact.abi,
        functionName: 'registerNewUser',
        args: [profile.txid],
        account: walletClient.account,
      });

      const txHash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      console.log(
        `Seeded user profile ${index + 1}/${profiles.length} for address ${profile.address}`
      );
    } catch (error: any) {
      const errMsg = error?.message || error?.toString?.() || '';
      if (errMsg.includes('User already registered')) {
        console.log(`User already registered for address ${profile.address}`);
      } else {
        console.error(`Error processing profile ${index + 1}:`, error);
      }
    }
  }
}

async function main() {
  await seedUserProfiles();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
