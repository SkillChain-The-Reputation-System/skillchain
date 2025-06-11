import hre from "hardhat";
import path from "path";
import Papa from "papaparse";
import fs from "fs";
import ChallengeManagerModule from "../ignition/modules/ChallengeManager";
import ModerationEscrowModule from "../ignition/modules/ModerationEscrow";

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

interface ModeratorReviewData {
  moderator_address: string;
  challenge_id: number;
  review_txid: string;
  relevance: number;
  technical_correctness: number;
  completeness: number;
  clarity: number;
  originality: number;
  unbiased: number;
  plagiarism_free: number;
  suggested_difficulty: number;
  suggested_category: number;
  suggested_solve_time: number;
}

interface ReputationSeedData {
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
  CLOUD_COMPUTING: 13,
} as const;

async function seedReputationScores(
  publicClient: any,
  reputationManagerContract: any,
  ownerClient: any
) {
  const csvPath_reputation = path.resolve(__dirname, "reputation_seeds.csv");

  if (!fs.existsSync(csvPath_reputation)) {
    console.log(
      `Reputation seeds CSV not found: ${csvPath_reputation}, skipping reputation seeding`
    );
    return;
  }

  console.log(`Reading reputation seeds from: ${csvPath_reputation}`);
  const reputationDataFile = fs.readFileSync(csvPath_reputation, "utf8");

  const parsed_reputation = Papa.parse<ReputationSeedData>(reputationDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const reputationData = parsed_reputation.data;

  if (reputationData.length === 0) {
    console.log("No reputation data found in CSV file");
    return;
  }

  console.log(`Seeding reputation for ${reputationData.length} addresses...`);

  for (const [index, row] of reputationData.entries()) {
    try {
      console.log(
        `Processing address ${index + 1}/${reputationData.length}: ${
          row.address
        }`
      );

      // Process each domain for this address
      for (const [domainName, domainValue] of Object.entries(DOMAINS)) {
        const reputationValue = row[domainName as keyof ReputationSeedData];

        // Skip if value is 0 or undefined
        if (!reputationValue || reputationValue === 0) {
          continue;
        }

        // Convert to number to ensure proper type
        const deltaValue = Number(reputationValue);
        if (isNaN(deltaValue)) {
          console.log(
            `  ⚠️ Invalid value for ${domainName}: ${reputationValue}`
          );
          continue;
        }

        try {
          console.log(`  Setting ${domainName} to ${deltaValue}...`);

          // Simulate the transaction first
          const { request } = await publicClient.simulateContract({
            address: reputationManagerContract.address,
            abi: reputationManagerContract.abi,
            functionName: "emergencyAdjustReputation",
            args: [row.address, domainValue, BigInt(deltaValue)],
            account: ownerClient.account,
          });

          // Send the transaction
          const txHash = await ownerClient.writeContract(request);
          console.log(`    Transaction sent: ${txHash}`);

          // Wait for transaction confirmation
          await publicClient.waitForTransactionReceipt({ hash: txHash });
          console.log(`    ✅ Reputation set successfully for ${domainName}`);

          // Add a small delay between transactions to avoid overwhelming the network
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error: any) {
          console.error(
            `    ❌ Error setting ${domainName}:`,
            error?.message || error
          );
        }
      }
    } catch (error) {
      console.error(`Error processing reputation for ${row.address}:`, error);
    }
  }

  console.log("✅ Reputation seeding completed!");
}

async function seedModeratorReviews(
  publicClient: any,
  challengeManagerContract: any,
  walletClients: any[],
  challengeIdToSeed: number
) {
  const csvPath_reviews = path.resolve(__dirname, "moderator_reviews.csv");
  const reviewDataFile = fs.readFileSync(csvPath_reviews, "utf8");
  const parsed_reviews = Papa.parse<ModeratorReviewData>(reviewDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });
  const reviews = parsed_reviews.data.filter(
    (review) => review.challenge_id === challengeIdToSeed
  );

  if (reviews.length === 0) {
    console.log(`No reviews found for challenge ID: ${challengeIdToSeed}`);
    return;
  }
  // Note: Moderator roles and reputation are already seeded in beforeEach
  console.log(
    `Processing ${reviews.length} reviews for challenge ${challengeIdToSeed}...`
  );

  for (const [index, review] of reviews.entries()) {
    try {
      console.log(
        `Processing review ${index + 1}/${reviews.length} for challenge ID ${
          review.challenge_id
        } by moderator ${review.moderator_address}`
      );

      const moderatorWalletClient = walletClients.find(
        (client) =>
          client.account.address.toLowerCase() ===
          review.moderator_address.toLowerCase()
      );

      if (!moderatorWalletClient) {
        console.warn(
          `Moderator wallet client not found for address: ${review.moderator_address}. Skipping this review.`
        );
        continue;
      }

      // Join review pool first
      try {
        const { request: joinRequest } = await publicClient.simulateContract({
          address: challengeManagerContract.address,
          abi: challengeManagerContract.abi,
          functionName: "joinReviewPool",
          args: [review.challenge_id, review.review_txid],
          account: moderatorWalletClient.account,
        });
        const joinTxHash = await moderatorWalletClient.writeContract(
          joinRequest
        );
        console.log(
          `Join review pool transaction sent: ${joinTxHash} by ${review.moderator_address} for challenge ${review.challenge_id}`
        );
        await publicClient.waitForTransactionReceipt({ hash: joinTxHash });
        console.log(
          `Join review pool transaction confirmed for ${review.moderator_address}`
        );
      } catch (joinError: any) {
        if (
          joinError.message.includes(
            "You have already joined this review pool"
          ) ||
          joinError.message.includes("Max moderators reached")
        ) {
          console.log(
            `Moderator ${review.moderator_address} already joined or pool is full for challenge ${review.challenge_id}. Proceeding to submit review.`
          );
        } else {
          console.error(
            `Error joining review pool for moderator ${review.moderator_address} and challenge ${review.challenge_id}:`,
            joinError
          );
          continue;
        }
      }

      // Send transaction to submit moderator review
      const { request: reviewRequest } = await publicClient.simulateContract({
        address: challengeManagerContract.address,
        abi: challengeManagerContract.abi,
        functionName: "submitModeratorReview",
        args: [
          review.challenge_id,
          review.relevance,
          review.technical_correctness,
          review.completeness,
          review.clarity,
          review.originality,
          review.unbiased,
          review.plagiarism_free,
          review.suggested_difficulty,
          review.suggested_category,
          review.suggested_solve_time,
        ],
        account: moderatorWalletClient.account,
      });

      const reviewTxHash = await moderatorWalletClient.writeContract(
        reviewRequest
      );
      console.log(
        `Submit review transaction sent: ${reviewTxHash} by ${review.moderator_address}`
      );
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: reviewTxHash,
      });

      console.log(
        `Submit review transaction confirmed in block ${receipt.blockNumber} for moderator ${review.moderator_address}`
      );
    } catch (error) {
      console.error(
        `Error processing review ${index + 1} for challenge ID ${
          review.challenge_id
        } by moderator ${review.moderator_address}:`,
        error
      );
    }
  }
}

async function seedPendingChallenges(
  publicClient: any,
  ownerClient: any,
  ChallengeManager_contract: any
) {
  const csvPath = path.resolve(__dirname, "pending-challenges.csv");
  console.log(`Reading CSV from: ${csvPath}`);
  const pendingChallengeDataFile = fs.readFileSync(csvPath, "utf8");

  const parsed = Papa.parse<PendingChallengeData>(pendingChallengeDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });
  const pendingChallenges = parsed.data;

  for (const [index, challenge] of pendingChallenges.entries()) {
    try {
      console.log(
        `Processing pending challenge ${index + 1}/${pendingChallenges.length}`
      );
      // Send transaction to add challenge
      const { request } = await publicClient.simulateContract({
        address: ChallengeManager_contract.address,
        abi: ChallengeManager_contract.abi,
        functionName: "seedChallenge",
        args: [
          challenge.contributor,
          challenge.title_url,
          challenge.description_url,
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
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    } catch (error) {
      console.error(`Error processing pending challenge ${index + 1}:`, error);
    }
  }
}

describe("Challenge Finalized -> Update Reputation", () => {
  let publicClient: any, walletClients: any[];
  let ownerClient: any, client1: any, client2: any;
  let ownerAddress: string, client1Address: string, client2Address: string;
  let ReputationManager_contract: any;
  let ChallengeManager_contract: any;
  let RoleManager_contract: any;
  beforeEach(async () => {
    // setup clients
    publicClient = await hre.viem.getPublicClient();
    walletClients = await hre.viem.getWalletClients();
    [ownerClient, client1, client2] = walletClients;
    ownerAddress = ownerClient.account.address;
    client1Address = client1.account.address;
    client2Address = client2.account.address; // Deploy contracts using Ignition
    // Deploy ModerationEscrowModule which includes ChallengeManager with proper configuration
    const moderationDeployment = await hre.ignition.deploy(
      ModerationEscrowModule
    );
    ChallengeManager_contract = moderationDeployment.challengeManager;

    // Get the base deployment to access other contracts
    const baseDeployment = await hre.ignition.deploy(ChallengeManagerModule);
    // Get ReputationManager from the module dependency
    ReputationManager_contract = baseDeployment.reputationManager;
    // Get RoleManager from the module dependency
    RoleManager_contract = baseDeployment.roleManager;

    // Seed reputation scores and grant moderator roles
    await seedReputationScores(
      publicClient,
      ReputationManager_contract,
      ownerClient
    );

    // Seed pending challenge:
    await seedPendingChallenges(
      publicClient,
      ownerClient,
      ChallengeManager_contract
    );
  });

  it("should update reputation after challenge is finalized", async () => {
    const challengeId = 6;

    // Seed 3 review -> Finalize the challenge
    await seedModeratorReviews(
      publicClient,
      ChallengeManager_contract,
      walletClients,
      challengeId
    );
  });
});
