import hre from "hardhat";
import { isAddress } from "viem";
import ReputationManagerArtifact from '../../artifacts/contracts/ReputationManager.sol/ReputationManager.json';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const abi = ReputationManagerArtifact.abi;
const contractAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'; // ReputationManager address from deployed_addresses.json

const csvPath = path.resolve(__dirname, '../data/reputation_adjustments.csv');

// Domain enum mapping - matching Constants.sol
const DOMAINS = {
  COMPUTER_SCIENCE_FUNDAMENTALS: 0,
  SOFTWARE_DEVELOPMENT: 1,
  SYSTEMS_AND_NETWORKING: 2,
  CYBERSECURITY: 3,
  DATA_SCIENCE_AND_ANALYTICS: 4,
  DATABASE_ADMINISTRATION: 5,
  QUALITY_ASSURANCE_AND_TESTING: 6,
  PROJECT_MANAGEMENT: 7,
  USER_EXPERIENCE_AND_DESIGN: 8,
  BUSINESS_ANALYSIS: 9,
  ARTIFICIAL_INTELLIGENCE: 10,
  BLOCKCHAIN_AND_CRYPTOCURRENCY: 11,
  NETWORK_ADMINISTRATION: 12,
  CLOUD_COMPUTING: 13
} as const;

interface ReputationAdjustmentData {
  address: string;
  COMPUTER_SCIENCE_FUNDAMENTALS: number;
  SOFTWARE_DEVELOPMENT: number;
  SYSTEMS_AND_NETWORKING: number;
  CYBERSECURITY: number;
  DATA_SCIENCE_AND_ANALYTICS: number;
  DATABASE_ADMINISTRATION: number;
  QUALITY_ASSURANCE_AND_TESTING: number;
  PROJECT_MANAGEMENT: number;
  USER_EXPERIENCE_AND_DESIGN: number;
  BUSINESS_ANALYSIS: number;
  ARTIFICIAL_INTELLIGENCE: number;
  BLOCKCHAIN_AND_CRYPTOCURRENCY: number;
  NETWORK_ADMINISTRATION: number;
  CLOUD_COMPUTING: number;
}

async function adjustReputations() {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      console.log("Please create a reputation_adjustments.csv file with the following format:");
      console.log("address,COMPUTER_SCIENCE_FUNDAMENTALS,SOFTWARE_DEVELOPMENT,SYSTEMS_AND_NETWORKING,CYBERSECURITY,DATA_SCIENCE_AND_ANALYTICS,DATABASE_ADMINISTRATION,QUALITY_ASSURANCE_AND_TESTING,PROJECT_MANAGEMENT,USER_EXPERIENCE_AND_DESIGN,BUSINESS_ANALYSIS,ARTIFICIAL_INTELLIGENCE,BLOCKCHAIN_AND_CRYPTOCURRENCY,NETWORK_ADMINISTRATION,CLOUD_COMPUTING");
      console.log("0x123...,5,-2,10,0,8,0,0,15,-3,0,12,20,0,0");
      console.log("Where positive numbers increase reputation and negative numbers decrease it");
      return;
    }

    console.log(`Reading CSV from: ${csvPath}`);
    const csvData = fs.readFileSync(csvPath, 'utf8');

    const parsed = Papa.parse<ReputationAdjustmentData>(csvData, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV parsing errors:", parsed.errors);
      return;
    }

    const adjustmentData = parsed.data;
    
    if (adjustmentData.length === 0) {
      console.log("No data found in CSV file");
      return;
    }

    const publicClient = await hre.viem.getPublicClient();
    const [adminClient] = await hre.viem.getWalletClients(); // account #0 (admin)

    console.log(`Using admin account: ${adminClient.account.address}`);
    console.log(`ReputationManager contract: ${contractAddress}`);
    console.log(`Processing ${adjustmentData.length} addresses...\n`);

    for (const [index, row] of adjustmentData.entries()) {
      console.log(`\n📋 Processing address ${index + 1}/${adjustmentData.length}: ${row.address}`);

      // Validate address format
      if (!isAddress(row.address)) {
        console.error(`❌ Invalid address format: ${row.address}`);
        continue;
      }      // Process each domain for this address
      for (const [domainName, domainValue] of Object.entries(DOMAINS)) {
        const reputationDelta = row[domainName as keyof ReputationAdjustmentData];
        
        // Skip if delta is 0 or undefined
        if (!reputationDelta || reputationDelta === 0) {
          continue;
        }

        // Convert to number to ensure proper type
        const deltaValue = Number(reputationDelta);
        if (isNaN(deltaValue)) {
          console.log(`  ⚠️ Invalid value for ${domainName}: ${reputationDelta}`);
          continue;
        }

        try {
          console.log(`  🔄 Adjusting ${domainName} by ${deltaValue > 0 ? '+' : ''}${deltaValue}...`);

            // Check current reputation before adjustment (optional, for logging)
          try {
            const currentReputation = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: abi,
              functionName: 'getDomainReputation',
              args: [row.address, domainValue],
            });
            console.log(`    Current reputation: ${currentReputation}`);
          } catch (error: any) {
            console.log(`    Could not fetch current reputation: ${error.message}`);
          }

          // Simulate the transaction first
          const { request } = await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: abi,
            functionName: 'emergencyAdjustReputation',
            args: [row.address, domainValue, BigInt(deltaValue)],
            account: adminClient.account,
          });

          // Send the transaction
          const txHash = await adminClient.writeContract(request);
          console.log(`    📤 Transaction sent: ${txHash}`);
          
          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
          });
          
          if (receipt.status === 'success') {
            console.log(`    ✅ Adjustment successful for ${domainName}`);
            
            // Check new reputation after adjustment
            try {
              const newReputation = await publicClient.readContract({
                address: contractAddress as `0x${string}`,
                abi: abi,
                functionName: 'getDomainReputation',
                args: [row.address, domainValue],
              });
              console.log(`    New reputation: ${newReputation}`);
            } catch (error: any) {
              console.log(`    Could not fetch new reputation: ${error.message}`);
            }
          } else {
            console.log(`    ❌ Transaction failed for ${domainName}`);
          }

          // Add a small delay between transactions to avoid overwhelming the network
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
          console.error(`    ❌ Error adjusting ${domainName}:`, error?.message || error);
          
          // Check if it's a revert with reason
          if (error?.message?.includes('revert')) {
            const revertReason = error.message.match(/revert (.+?)(?:\n|$)/)?.[1] || 'Unknown reason';
            console.error(`    Revert reason: ${revertReason}`);
          }
        }
      }
    }

    console.log("\n🎉 Reputation adjustment process completed!");

  } catch (error: any) {
    console.error("Error in reputation adjustment process:", error?.message || error);
  }
}

// Helper function to check current reputation for a user
async function checkUserReputation(userAddress: string) {
  try {
    if (!isAddress(userAddress)) {
      console.error(`Invalid address format: ${userAddress}`);
      return;
    }

    const publicClient = await hre.viem.getPublicClient();

    console.log(`\n📊 Reputation Report for ${userAddress}:`);
    console.log("===============================================");
      // Check global reputation
    try {
      const globalReputation = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: 'getGlobalReputation',
        args: [userAddress],
      });
      console.log(`Global Reputation: ${globalReputation}`);
    } catch (error: any) {
      console.log(`Global Reputation: Unable to fetch (${error.message})`);
    }

    console.log("\nDomain-specific Reputation:");
    console.log("---------------------------");    
    // Check domain-specific reputation
    for (const [domainName, domainValue] of Object.entries(DOMAINS)) {
      try {
        const domainReputation = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: abi,
          functionName: 'getDomainReputation',
          args: [userAddress, domainValue],
        });
        console.log(`${domainName.padEnd(35)}: ${domainReputation}`);
      } catch (error: any) {
        console.log(`${domainName.padEnd(35)}: Unable to fetch`);
      }
    }
    
    console.log("===============================================\n");
    
  } catch (error: any) {
    console.error("Error checking user reputation:", error?.message || error);
  }
}

// Check command line arguments - handle both direct node execution and hardhat run
const args = process.argv.slice(2);
const hardhatArgs = process.env.HARDHAT_TASK_ARGS ? process.env.HARDHAT_TASK_ARGS.split(' ') : [];
const allArgs = [...args, ...hardhatArgs];

if (allArgs.includes('help') || allArgs.includes('--help') || allArgs.includes('-h')) {
  console.log("Reputation Adjustment Script");
  console.log("============================");
  console.log("Usage:");
  console.log("  npm run adjust:reputation                    - Process CSV file and adjust reputations");
  console.log("  npm run adjust:reputation check <addr>       - Check current reputation for a user");
  console.log("  npm run adjust:reputation help               - Show this help message");
  console.log("");
  console.log("CSV Format:");
  console.log("  address,COMPUTER_SCIENCE_FUNDAMENTALS,SOFTWARE_DEVELOPMENT,...");
  console.log("  0x123...,5,-2,10,0,8,0,0,15,-3,0,12,20,0,0");
  console.log("");
  console.log("Notes:");
  console.log("  - Positive numbers increase reputation");
  console.log("  - Negative numbers decrease reputation");
  console.log("  - Zero values are ignored");
} else if (allArgs.includes('check') || allArgs.includes('--check') || allArgs.includes('-c')) {
  const checkIndex = Math.max(allArgs.indexOf('check'), allArgs.indexOf('--check'), allArgs.indexOf('-c'));
  const userAddress = allArgs[checkIndex + 1];
  if (userAddress) {
    checkUserReputation(userAddress);
  } else {
    console.log("Usage: npm run adjust:reputation check <user_address>");
  }
} else {
  adjustReputations();
}