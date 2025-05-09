import { readContract } from "@wagmi/core";
import {
  ContractConfig_ChallengeManager,
  ContractConfig_UserDataManager,
  ContractConfig_SolutionManager
} from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import {
  ChallengeInterface,
  JoinedChallengePreview,
  FetchUserDataOnChainOutput,
  ModeratorReview,
  ChallengeWorkspace,
  SolutionInterface,
} from "./interfaces";
import { fetchStringDataOffChain } from "./fetching-offchain-data-utils";
import {
  QualityFactorAnswer,
  ChallengeDifficultyLevel,
  Domain,
  ChallengeSolutionProgress,
} from "@/constants/system";

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
};

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
      const description = await fetchStringDataOffChain(
        challenge.description_url
      );

      return {
        id: challenge.id.toString(),
        contributor: challenge.contributor,
        title,
        description,
        category: challenge.category.toString(),
        contributeAt: challenge.contribute_at,
        status: challenge.status,
        qualityScore: challenge.quality_score,
        difficultyLevel: challenge.difficulty_level,
        solveTime: challenge.solve_time,
      };
    })
  );

  return meaning_joined_review_pool_challenges;
};

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
    qualityScore: challenge.quality_score,
    difficultyLevel: challenge.difficulty_level,
    solveTime: challenge.solve_time,
  };
};

export const getModeratorReviewOfChallenge = async (
  challenge_id: number,
  address: `0x${string}`
): Promise<ModeratorReview | null> => {
  try {
    const review = (await readContract(wagmiConfig, {
      address: ContractConfig_ChallengeManager.address as `0x${string}`,
      abi: ContractConfig_ChallengeManager.abi,
      functionName: "getModeratorReviewOfChallenge",
      args: [challenge_id, address],
    })) as any;

    // Build a strongly-typed ModeratorReview object to force TS validation
    const moderatorReview: ModeratorReview = {
      moderator: review.moderator as string,
      challenge_id: Number(review.challenge_id),
      review_time: Number(review.review_time),
      relevance: Number(review.relevance) as QualityFactorAnswer,
      technical_correctness: Number(
        review.technical_correctness
      ) as QualityFactorAnswer,
      completeness: Number(review.completeness) as QualityFactorAnswer,
      clarity: Number(review.clarity) as QualityFactorAnswer,
      originality: Number(review.originality) as QualityFactorAnswer,
      unbiased: Number(review.unbiased) as QualityFactorAnswer,
      plagiarism_free: Number(review.plagiarism_free) as QualityFactorAnswer,
      suggested_difficulty: Number(
        review.suggested_difficulty
      ) as ChallengeDifficultyLevel,
      suggested_category: Number(review.suggested_category) as Domain,
      suggested_solve_time: Number(review.suggested_solve_time),
    };
    return moderatorReview;
  } catch (error) {
    console.error("Error fetching my moderator review:", error);
    return null;
  }
};

export const getReviewQuorum = async (): Promise<number> => {
  const quorum = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getReviewQuorum",
    args: [],
  })) as number | bigint;
  return Number(quorum);
};

export const getReviewPoolSize = async (
  challenge_id: number
): Promise<number> => {
  const size = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getReviewPoolSize",
    args: [challenge_id],
  })) as number | bigint;
  return Number(size);
};

export const getChallengeFinalizedStatus = async (
  challenge_id: number
): Promise<boolean> => {
  const is_finalized = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getChallengeFinalizedStatus",
    args: [challenge_id],
  })) as boolean;
  return is_finalized;
};

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
      const title = await fetchStringDataOffChain(challenge.title_url);
      const description = await fetchStringDataOffChain(
        challenge.description_url
      );

      return {
        id: challenge.id.toString(),
        contributor: challenge.contributor,
        title,
        description,
        category: challenge.category.toString(),
        contributeAt: challenge.contribute_at,
        status: challenge.status,
        qualityScore: challenge.quality_score,
        difficultyLevel: challenge.difficulty_level,
        solveTime: challenge.solve_time,
      };
    })
  );

  return challengesWithMeaningfulData;
};

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
        id: challenge.id.toString(),
        contributor: challenge.contributor,
        title,
        description,
        category: challenge.category.toString(),
        contributeAt: challenge.contribute_at,
        status: challenge.status,
        qualityScore: challenge.quality_score,
        difficultyLevel: challenge.difficulty_level,
        solveTime: challenge.solve_time,
      };
    })
  );

  return meaningPendingChallenges;
};

export const fetchApprovedChallenges = async (): Promise<ChallengeInterface[]> => {
  const approvedChallenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getApprovedChallenges",
    args: [],
  });

  const meaningApprovedChallenges = await Promise.all(
    (approvedChallenges as any[]).map(async (challenge) => {
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
        qualityScore: challenge.quality_score,
        difficultyLevel: challenge.difficulty_level,
        solveTime: challenge.solve_time,
      };
    })
  );

  return meaningApprovedChallenges;
};

export const fetchJoinedChallengesByUser = async (
  address: `0x${string}`
): Promise<ChallengeInterface[]> => {
  const joinedChallenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getJoinedChallengesByUser",
    args: [address],
  });

  const meaningJoinedChallenges = await Promise.all(
    (joinedChallenges as any[]).map(async (challenge) => {
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
        qualityScore: challenge.quality_score,
        difficultyLevel: challenge.difficulty_level,
        solveTime: challenge.solve_time,
      };
    })
  );

  return meaningJoinedChallenges;
}

export const fetchJoinedChallengesPreviewByUser = async (address: `0x${string}`): Promise<JoinedChallengePreview[]> => {
  const previewList = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getJoinedChallengesByUserForPreview",
    args: [address, ContractConfig_SolutionManager.address],
  });

  const meaningPreviewList = await Promise.all(
    (previewList as any[]).map(async (preview) => {
      const title = await fetchStringDataOffChain(preview.title_url);
      const description = await fetchStringDataOffChain(preview.description_url);

      return {
        challengeId: preview.challenge_id,
        title,
        description,
        category: preview.domain.toString(),
        progress: preview.progress,
        joinedAt: preview.joined_at,
        score: preview.score,
      };
    })
  );

  return meaningPreviewList;
}

export const fetchUserHasJoinedChallengeState = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<boolean> => {
  const has_joined = await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "checkUserJoinedChallenge",
    args: [address, challenge_id],
  }) as boolean;

  return has_joined;
};

export const fetchSolutionByUserAndChallengeId = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<SolutionInterface | null> => {
  const fetchedSolution = await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getSolutionByUserAndChallengeId",
    args: [address, challenge_id],
  }) as any;

  if (!fetchedSolution)
    return null;

  const solution = fetchedSolution.solution_url != "" ? await fetchStringDataOffChain(fetchedSolution.solution_url) : "";

  return {
    user: fetchedSolution.user,
    challengeId: fetchedSolution.challenge_id,
    solution: solution,
    createdAt: fetchedSolution.created_at,
    submittedAt: fetchedSolution.submitted_at,
    progress: fetchedSolution.progress,
    score: fetchedSolution.score
  };
}

export const fetchChallengeWorkspace = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<ChallengeWorkspace | null> => {
  const fetchedChallenge = await getChallengeById(challenge_id);
  const fetchedSolution = await fetchSolutionByUserAndChallengeId(address, challenge_id);

  if (!fetchedChallenge || !fetchedSolution)
    return null;

  if (fetchedChallenge.id != fetchedSolution.challengeId)
    return null;

  return {
    challenge: fetchedChallenge,
    solution: fetchedSolution
  };
}
