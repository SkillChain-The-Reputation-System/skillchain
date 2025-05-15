import hre from "hardhat";
import path from "path";
import Papa from "papaparse";
import fs from "fs";
import ChallengeManagerModule from "../ignition/modules/ChallengeManager";

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
          args: [review.challenge_id],
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

  beforeEach(async () => {
    // setup clients
    publicClient = await hre.viem.getPublicClient();
    walletClients = await hre.viem.getWalletClients();
    [ownerClient, client1, client2] = walletClients;
    ownerAddress = ownerClient.account.address;
    client1Address = client1.account.address;
    client2Address = client2.account.address;

    // Deploy contracts using Ignition
    const deployment = await hre.ignition.deploy(ChallengeManagerModule);
    ChallengeManager_contract = deployment.challengeManager;
    // Get ReputationManager from the module dependency
    ReputationManager_contract = deployment["reputationManager"];

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
