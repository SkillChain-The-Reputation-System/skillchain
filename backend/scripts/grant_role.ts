import hre from "hardhat";
import { keccak256, toBytes, isAddress } from "viem";
import RoleManagerArtifact from '../artifacts/contracts/RoleManager.sol/RoleManager.json';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const abi = RoleManagerArtifact.abi;
const contractAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'; // RoleManager address from deployed_addresses.json

const csvPath = path.resolve(__dirname, 'grant_roles.csv');

interface RoleGrantData {
  address: string;
  contributor: number;
  evaluator: number;
  moderator: number;
}

// Get role hash using keccak256
function getRoleHash(roleName: string): `0x${string}` {
  return keccak256(toBytes(roleName));
}

async function grantRoles() {
  try {
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      console.log("Please create a grant_roles.csv file with the following format:");
      console.log("address,contributor,evaluator,moderator");
      console.log("0x123...,1,0,0");
      console.log("Where 1 = grant role, 0 = don't grant role");
      return;
    }

    console.log(`Reading CSV from: ${csvPath}`);
    const csvData = fs.readFileSync(csvPath, 'utf8');

    const parsed = Papa.parse<RoleGrantData>(csvData, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV parsing errors:", parsed.errors);
      return;
    }

    const roleGrantData = parsed.data;
    
    if (roleGrantData.length === 0) {
      console.log("No data found in CSV file");
      return;
    }

    const publicClient = await hre.viem.getPublicClient();
    const [adminClient] = await hre.viem.getWalletClients(); // account #0 (admin)

    console.log(`Using admin account: ${adminClient.account.address}`);
    console.log(`RoleManager contract: ${contractAddress}`);
    console.log(`Processing ${roleGrantData.length} addresses...\n`);

    // Define role mappings
    const roleMapping = [
      { key: 'contributor', name: 'CONTRIBUTOR_ROLE', hash: getRoleHash('CONTRIBUTOR_ROLE') },
      { key: 'evaluator', name: 'EVALUATOR_ROLE', hash: getRoleHash('EVALUATOR_ROLE') },
      { key: 'moderator', name: 'MODERATOR_ROLE', hash: getRoleHash('MODERATOR_ROLE') }
    ];

    for (const [index, row] of roleGrantData.entries()) {
      console.log(`\n📋 Processing address ${index + 1}/${roleGrantData.length}: ${row.address}`);

      // Validate address format
      if (!isAddress(row.address)) {
        console.error(`❌ Invalid address format: ${row.address}`);
        continue;
      }

      // Process each role for this address
      for (const role of roleMapping) {
        const shouldGrant = row[role.key as keyof RoleGrantData] === 1;
        
        if (!shouldGrant) {
          continue; // Skip if not marked for granting
        }

        try {
          console.log(`  🔍 Checking ${role.name}...`);

          // Check if user already has the role
          const hasRole = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: abi,
            functionName: 'hasRole',
            args: [role.hash, row.address],
          });

          if (hasRole) {
            console.log(`  ⚠️  Address already has ${role.name}`);
            continue;
          }

          // Grant the role using emergencyGrantRole
          console.log(`  📝 Granting ${role.name}...`);
          
          // Simulate the transaction first
          const { request } = await publicClient.simulateContract({
            address: contractAddress as `0x${string}`,
            abi: abi,
            functionName: 'emergencyGrantRole',
            args: [role.hash, row.address],
            account: adminClient.account,
          });

          // Send the transaction
          const txHash = await adminClient.writeContract(request);
          console.log(`  📤 Transaction sent: ${txHash}`);
          
          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ 
            hash: txHash 
          });

          if (receipt.status === 'success') {
            console.log(`  ✅ ${role.name} successfully granted`);
            
            // Verify the role was granted
            const hasRoleAfter = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: abi,
              functionName: 'hasRole',
              args: [role.hash, row.address],
            });
            console.log(`  ✓ Verification: User has role = ${hasRoleAfter}`);
          } else {
            console.log(`  ❌ Transaction failed for ${role.name}`);
          }

        } catch (error: any) {
          console.error(`  ❌ Error granting ${role.name}:`, error?.message || error);
          
          // Parse common error messages
          if (error?.message?.includes("InvalidRole")) {
            console.error(`  ❌ Invalid role specified: ${role.name}`);
          } else if (error?.message?.includes("AccessControl")) {
            console.error(`  ❌ Access denied. Make sure you're using an admin account`);
          }
        }
      }
    }

    console.log("\n🎉 Role granting process completed!");

  } catch (error: any) {
    console.error("Error in role granting process:", error?.message || error);
  }
}

// Helper function to list available roles and their requirements
async function listRoles() {
  try {
    const publicClient = await hre.viem.getPublicClient();

    console.log("\n📋 Available Roles and Requirements:");
    console.log("=====================================");
    
    const roles = [
      { name: 'CONTRIBUTOR_ROLE', hash: getRoleHash('CONTRIBUTOR_ROLE') },
      { name: 'EVALUATOR_ROLE', hash: getRoleHash('EVALUATOR_ROLE') },
      { name: 'MODERATOR_ROLE', hash: getRoleHash('MODERATOR_ROLE') }
    ];

    for (const role of roles) {
      try {
        const requirement = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: abi,
          functionName: 'role_reputation_requirements',
          args: [role.hash],
        });
        console.log(`${role.name}: ${requirement} reputation points required`);
      } catch (error: any) {
        console.log(`${role.name}: Unable to fetch requirement`);
      }
    }
    console.log("=====================================\n");
    
  } catch (error: any) {
    console.error("Error listing roles:", error?.message || error);
  }
}

// Check if user wants to list roles
if (process.argv.includes('--list') || process.argv.includes('-l')) {
  listRoles();
} else {
  grantRoles();
}
