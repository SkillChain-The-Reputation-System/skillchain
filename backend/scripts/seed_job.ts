import hre from "hardhat"
import { createWalletClient, http, decodeEventLog } from "viem"
import { hardhat } from "viem/chains"
import { privateKeyToAccount } from 'viem/accounts'
import JobManagerArtifact from '../artifacts/contracts/JobManager.sol/JobManager.json'
import JobApplicationManagerArtifact from '../artifacts/contracts/JobApplicationManager.sol/JobApplicationManager.json'
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

const csvPath = path.resolve(__dirname, 'job.csv');

if (!fs.existsSync(csvPath)) {
  throw new Error("CSV file not found");
}

interface JobData {
  recruiter_pvk: `0x${string}`;
  content_id: string;
}

type JobCreatedEvent = {
  id: `0x${string}`;
  recruiter: `0x${string}`;
  content_id: string;
}

type JobInfo = {
  [recruiter_pvk: `0x${string}`]: `0x${string}`[];
}

const jobManagerContract = {
  abi: JobManagerArtifact.abi,
  address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
} as const

const jobApplicationManagerContract = {
  abi: JobApplicationManagerArtifact.abi,
  address: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
} as const

const jobDataFile = fs.readFileSync(csvPath, 'utf8');
const parsed = Papa.parse<JobData>(jobDataFile, {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true,
});
const jobs = parsed.data;

const jobsInfo: JobInfo = {}

async function seedJobs() {
  const publicClient = await hre.viem.getPublicClient();

  for (const [index, job] of jobs.entries()) {
    try {
      const account = privateKeyToAccount(job.recruiter_pvk);

      if (!jobsInfo[job.recruiter_pvk]) {
        jobsInfo[job.recruiter_pvk] = []
      }

      const walletClient = createWalletClient({
        account: account,
        chain: hardhat,
        transport: http()
      })

      const { request } = await publicClient.simulateContract({
        ...jobManagerContract,
        functionName: 'createJob',
        args: [job.content_id],
        account: account,
      })

      const createtxHash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: createtxHash });

      const logs = receipt.logs;

      for (const log of logs) {
        const topics = decodeEventLog({
          abi: jobManagerContract.abi,
          data: log.data,
          topics: log.topics,
        })

        const { id } = topics.args as unknown as JobCreatedEvent;

        console.log(`Created job ${index + 1} with content ID: ${id}`)

        jobsInfo[job.recruiter_pvk].push(id);
      }
    } catch (error) {
      console.error(`Error processing challenge ${index + 1}:`, error);
    }
  }
}

async function publishJob() {
  const publicClient = await hre.viem.getPublicClient();

  for (const recruiter_pvk in jobsInfo) {
    const recruiter_jobs = jobsInfo[recruiter_pvk as `0x${string}`];

    const account = privateKeyToAccount(recruiter_pvk as `0x${string}`);

    const walletClient = createWalletClient({
      account: account,
      chain: hardhat,
      transport: http()
    })

    for (const jobId of recruiter_jobs) {
      try {
        const { request } = await publicClient.simulateContract({
          ...jobManagerContract,
          functionName: 'publishJob',
          args: [jobId],
          account: account,
        })

        const txHash = await walletClient.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`Publish job with ID ${jobId}`)
      } catch (error) {
        console.error(`Error processing challenge `, error);
      }
    }
  }
}

async function haveJobsApplied() {
  const publicClient = await hre.viem.getPublicClient();
  const clients = await hre.viem.getWalletClients();

  const maxApplicant = 7;
  const minApplicant = 1;
  const range = maxApplicant - minApplicant + 1

  const allJobIds = Object.values(jobsInfo).flat();

  for (const jobId of allJobIds) {
    const count = Math.floor(Math.random() * range) + minApplicant;
    const shuffled = [...clients].sort(() => 0.5 - Math.random());
    const pickedClients = shuffled.slice(0, count);

    for (const client of pickedClients) {
      try {
        const { request } = await publicClient.simulateContract({
          ...jobApplicationManagerContract,
          functionName: 'submitApplication',
          args: [jobId],
          account: client.account,
        })

        const txHash = await client.writeContract(request);
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }
      catch (error) {
        console.error(`Error processing challenge `, error);
      }
    }

    console.log(`${count} applicants applied for job ${jobId}`)
  }
}

async function main() {
  await seedJobs();

  await publishJob();

  await haveJobsApplied();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });