import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Uploader } from '@irys/upload';
import { Ethereum } from '@irys/upload-ethereum';

interface UserProfileData {
  address: string;
  fullname: string;
  location: string;
  email: string;
  avatar_url: string;
  bio: string;
}

const csvPath = path.resolve(__dirname, '../data/user_profile.csv');
const outputCsvPath = path.resolve(__dirname, '../data/user_profiles.csv');

const getIrysUploader = async () => {
  const uploader = await Uploader(Ethereum)
    .withWallet(process.env.SKILLCHAIN_WALLET_PRIVATE_KEY as string)
    .withRpc(process.env.POLYGON_AMOY_RPC_URL as string)
    .devnet();
  return uploader;
};

const uploadData = async (data: any): Promise<string | undefined> => {
  const uploader = await getIrysUploader();
  try {
    const receipt = await uploader.upload(data);
    console.log(`Uploaded => https://gateway.irys.xyz/${receipt.id}`);
    return receipt.id;
  } catch (err) {
    console.error('Upload error', err);
    return undefined;
  }
};

async function seedUserProfiles() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<UserProfileData>(csvData, {
    header: true,
    skipEmptyLines: true,
  });
  const users = parsed.data;
  const results: string[] = ['address,txid'];
  for (const user of users) {
    const id = await uploadData(JSON.stringify(user));
    if (id) {
      results.push(`${user.address},${id}`);
    }
  }
  fs.writeFileSync(outputCsvPath, results.join('\n'));
}

async function main() {
  await seedUserProfiles();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
