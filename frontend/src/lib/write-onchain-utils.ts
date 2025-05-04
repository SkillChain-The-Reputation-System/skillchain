import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { ModeratorReviewValues } from "@/features/moderation/review-challenge-form";

export async function joinReviewPool(
  challengeId: number,
  address: `0x${string}`
) {
  // send transaction and return tx hash
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "joinReviewPool",
    args: [challengeId],
    account: address,
  });
  return txHash;
}

export async function waitForTransaction(txHash: `0x${string}`): Promise<void> {
  await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
  });
}


export async function submitModeratorReview(
  challengeId: number,
  address: `0x${string}`,
  data: ModeratorReviewValues
) {
  const txHash = await writeContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "submitModeratorReview",
    args: [
      challengeId,
      data.relevance,
      data.technical_correctness,
      data.completeness,
      data.clarity,
      data.originality,
      data.unbiased,
      data.plagiarism_free,
      data.suggested_difficulty,
      data.suggested_category,
      data.suggested_solve_time,
    ],
    account: address,
  });
  return txHash;
}

