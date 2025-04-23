import { readContract } from "@wagmi/core";
import { ContractConfig_ChallengeManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { fetchStringDataOffChain } from "./fetching-offchain-data-utils";
import { ChallengeInterface } from "./interfaces";

export const fetchContributedChallenges = async (
  address: `0x${string}`
): Promise<ChallengeInterface[]> => {
  const challenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getChallengesByContributor",
    args: [address],
  });

  // return challenges as FetchContributedChallengesOnChainOutput[];
  const challengesWithMeaningfulData = await Promise.all(
    (challenges as any[]).map(async (challenge) => {
      const title = await fetchStringDataOffChain(challenge.titleUrl); // Fetch title from URL
      const description = await fetchStringDataOffChain(challenge.descriptionUrl); // Fetch description from URL

      console.log("Fetched title url: ", title);
      console.log("Fetched description url: ", description);

      return {
        contributor: challenge.contributor,
        title, // Use the fetched title
        description, // Use the fetched description
        category: challenge.category,
        date: challenge.contributeAt, // Map contributeAt to date
        isApproved: challenge.isActive,
      };
    })
  );

  return challengesWithMeaningfulData;
}