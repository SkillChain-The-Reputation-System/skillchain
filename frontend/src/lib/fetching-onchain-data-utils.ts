import { readContract } from "@wagmi/core";
import { ContractConfig_ChallengeManager, ContractConfig_UserDataManager } from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import { ChallengeInterface, FetchUserDataOnChainOutput } from "./interfaces";
import { fetchStringDataOffChain } from "./fetching-offchain-data-utils";

export const fetchUserDataOnChain = async (
  address: `0x${string}`
): Promise<FetchUserDataOnChainOutput> => {
  const [username, avatar_url, bio_url] = await Promise.all([
    readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "getUsername",
      args: [address],
    }),
    readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "getAvatar",
      args: [address],
    }),
    readContract(wagmiConfig, {
      address: ContractConfig_UserDataManager.address as `0x${string}`,
      abi: ContractConfig_UserDataManager.abi,
      functionName: "getBio",
      args: [address],
    }),
  ]);

  return {
    username: username as string | undefined,
    avatar_url: avatar_url as string | undefined,
    bio_url: bio_url as string | undefined,
  };
};

export const checkUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const isAvailable = (await readContract(wagmiConfig, {
    address: ContractConfig_UserDataManager.address as `0x${string}`,
    abi: ContractConfig_UserDataManager.abi,
    functionName: "checkUsernameAvailable",
    args: [username],
  })) as boolean;

  return isAvailable;
};

export const getJoinReviewPoolStatus = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<boolean> => {
  const is_joined = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getJoinReviewPoolStatus",
    args: [challenge_id, address],
  })) as boolean;

  return is_joined;
}

export const fetchJoinedReviewPoolChallenges = async (
  address: `0x${string}`
): Promise<ChallengeInterface[]> => {
  const joined_review_pool_challenges = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getChallengesByModerator",
    args: [address],
  })) as ChallengeInterface[];

  const meaning_joined_review_pool_challenges = await Promise.all(
      (joined_review_pool_challenges as any[]).map(async (challenge) => {
        const title = await fetchStringDataOffChain(challenge.title_url);
        const description = await fetchStringDataOffChain(challenge.description_url);
  
        return {
          id: challenge.id.toString(),
          contributor: challenge.contributor,
          title,
          description,
          category: challenge.category.toString(),
          contributeAt: challenge.contribute_at,
          status: challenge.status,
        };
      })
    );

  return meaning_joined_review_pool_challenges;
}

export const getChallengeById = async (
  challenge_id: number
): Promise<ChallengeInterface | null> => {
  const challenge = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getChallengeById",
    args: [challenge_id],
  })) as any;

  if (!challenge) return null;

  const title = await fetchStringDataOffChain(challenge.title_url);
  const description = await fetchStringDataOffChain(challenge.description_url);

  return {
    id: challenge.id.toString(),
    contributor: challenge.contributor,
    title,
    description,
    category: challenge.category.toString(),
    contributeAt: challenge.contribute_at,
    status: challenge.status,
  };
}
