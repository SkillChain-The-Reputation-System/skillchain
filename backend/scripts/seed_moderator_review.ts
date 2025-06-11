// filepath: d:\Hai_Tuyen\thesis\skillchain\backend\scripts\seed_moderator_review.ts
import hre from "hardhat";
import ChallengeManagerArtifact from "../artifacts/contracts/ChallengeManager.sol/ChallengeManager.json";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

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

const abi = ChallengeManagerArtifact.abi;
// Replace with your deployed contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const csvPath = path.resolve(__dirname, "moderator_reviews.csv");

async function seedModeratorReview(challengeIdToSeed: number) {
  const publicClient = await hre.viem.getPublicClient();
  const walletClients = await hre.viem.getWalletClients();

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    return;
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const reviewDataFile = fs.readFileSync(csvPath, "utf8");

  const parsed = Papa.parse<ModeratorReviewData>(reviewDataFile, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true,
  });

  const reviews = parsed.data.filter(
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
          address: contractAddress,
          abi: abi,
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
        address: contractAddress,
        abi: abi,
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
        // Removed value parameter since submitModeratorReview is nonpayable
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

async function main() {
  const challengeIdToSeed = 6; // Choose a challenge ID to seed 3 moderaror reviews
  if (isNaN(challengeIdToSeed)) {
    console.error("Invalid challenge ID provided.");
    process.exit(1);
  }
  await seedModeratorReview(challengeIdToSeed);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
