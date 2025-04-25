import { readContract } from "@wagmi/core";
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { fetchStringDataOffChain } from "./fetching-offchain-data-utils";
import { ChallengeInterface, ChallengeStatus } from "./interfaces";

// Fetch contributed challenges of an user
export const fetchContributedChallenges = async (
  address: `0x${string}`
): Promise<ChallengeInterface[]> => {
  const challenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getChallengesByContributor",
    args: [address],
  });

  const challengesWithMeaningfulData = await Promise.all(
    (challenges as any[]).map(async (challenge) => {
      const title = await fetchStringDataOffChain(challenge.title_url); // Fetch title from URL
      const description = await fetchStringDataOffChain(challenge.description_url); // Fetch description from URL

      return {
        contributor: challenge.contributor,
        title,
        description,
        category: challenge.category.toString(),
        contributeAt: challenge.contribute_at,
        status: ChallengeStatus[Object.keys(ChallengeStatus)[challenge.status] as keyof typeof ChallengeStatus],
      };
    })
  );

  return challengesWithMeaningfulData;
}

// Fetch all pending challenges
export const fetchPendingChallenges = async (): Promise<ChallengeInterface[]> => {
  const pendingChallenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getPendingChallenges",
    args: [],
  });

  const meaningPendingChallenges = await Promise.all(
    (pendingChallenges as any[]).map(async (challenge) => {
      const title = await fetchStringDataOffChain(challenge.title_url);
      const description = await fetchStringDataOffChain(challenge.description_url);

      return {
        contributor: challenge.contributor,
        title,
        description,
        category: challenge.category.toString(),
        contributeAt: challenge.contribute_at,
        status: ChallengeStatus[Object.keys(ChallengeStatus)[challenge.status] as keyof typeof ChallengeStatus],
      };
    })
  );

  return meaningPendingChallenges;
}