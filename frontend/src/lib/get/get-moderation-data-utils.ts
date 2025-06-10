import { readContract } from "@wagmi/core";
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";

/**
 * Get the score deviation of a moderator's review compared to the final challenge score
 * @param challengeId - The ID of the challenge
 * @param moderatorAddress - The address of the moderator
 * @returns The absolute deviation between moderator's score and final quality score
 */
export const getScoreDeviationOfModeratorReview = async (
  challengeId: number,
  moderatorAddress: `0x${string}`
): Promise<number> => {
  try {
    const deviation = (await readContract(wagmiConfig, {
      address: ContractConfig_ChallengeManager.address as `0x${string}`,
      abi: ContractConfig_ChallengeManager.abi,
      functionName: "getScoreDeviationOfModeratorReview",
      args: [challengeId, moderatorAddress],
    })) as number | bigint;

    return Number(deviation);
  } catch (error) {
    console.error("Error fetching score deviation of moderator review:", error);
    throw error;
  }
};