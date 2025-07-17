import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Uploader } from '@irys/upload';
import { Ethereum } from '@irys/upload-ethereum';

interface ChallengeUploadData {
  title: string;
  category: number;
  description: string;
  bounty: number;
}

interface PendingChallengeData {
  contributor: string;
  challenge_txid: string;
  category: number | '';
  timestamp: number | '';
  status: number | '';
  quality_score: number | '';
  difficulty_level: number | '';
  solve_time: number | '';
}

const uploadCsvPath = path.resolve(__dirname, '../data/challenge-data-to-upload-irys.csv');
const pendingCsvPath = path.resolve(__dirname, '../data/pending-challenges.csv');
const challengeCsvPath = path.resolve(__dirname, '../data/challenge.csv');

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

async function uploadChallenges() {
  if (!fs.existsSync(uploadCsvPath)) {
    throw new Error(`CSV file not found: ${uploadCsvPath}`);
  }
  const csvData = fs.readFileSync(uploadCsvPath, 'utf8');
  const parsed = Papa.parse<ChallengeUploadData>(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  const challenges = parsed.data;

  const uploadedIds: string[] = [];

  for (const challenge of challenges) {
    const id = await uploadData(JSON.stringify(challenge));
    uploadedIds.push(id || '');
  }

  if (fs.existsSync(pendingCsvPath)) {
    const pendingData = fs.readFileSync(pendingCsvPath, 'utf8');
    const parsedPending = Papa.parse<PendingChallengeData>(pendingData, {
      header: true,
      skipEmptyLines: false,
    });
    const pendingChallenges = parsedPending.data;

    for (let i = 0; i < uploadedIds.length && i < pendingChallenges.length; i++) {
      (pendingChallenges[i] as PendingChallengeData).challenge_txid = uploadedIds[i];
    }

    const newCsv = Papa.unparse(pendingChallenges, { header: true });
    fs.writeFileSync(pendingCsvPath, newCsv);
  } else {
    const header = fs.readFileSync(challengeCsvPath, 'utf8').split('\n')[0];
    const headers = header.split(',');
    const template: any = {};
    for (const h of headers) {
      template[h] = '';
    }
    const newRows = uploadedIds.map((id) => {
      const row = { ...template };
      row['challenge_txid'] = id;
      return row;
    });
    const newCsv = Papa.unparse(newRows, { columns: headers });
    fs.writeFileSync(pendingCsvPath, newCsv);
  }
}

async function main() {
  await uploadChallenges();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
