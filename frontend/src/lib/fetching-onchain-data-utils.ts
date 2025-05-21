// filepath: d:\Hai_Tuyen\thesis\skillchain\frontend\src\lib\fetching-onchain-data-utils.ts
import { readContract, simulateContract } from "@wagmi/core";
import {
  ContractConfig_ChallengeManager,
  ContractConfig_UserDataManager,
  ContractConfig_SolutionManager,
  ContractConfig_ReputationManager,
  ContractConfig_JobManager,
} from "@/constants/contracts-config";
import { wagmiConfig } from "@/features/wallet/Web3Provider";
import {
  ChallengeInterface,
  JoinedChallengePreview,
  FetchUserDataOnChainOutput,
  ModeratorReview,
  SolutionInterface,
  ReviewData,
  UnderReviewSolutionPreview,
  SolutionReviewPool,
  EvaluationInterface,
  JobPreviewInterface,
} from "./interfaces";
import {
  fetchJsonDataOffChain,
  fetchStringDataOffChain,
} from "./fetching-offchain-data-utils";
import {
  QualityFactorAnswer,
  ChallengeDifficultyLevel,
  Domain,
  JobDurationLabels,
  JobDuration,
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
        completed: challenge.completed,
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
    completed: challenge.completed,
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

    // TODO: Get review data from Irys
    const review_data_raw = await fetchJsonDataOffChain(
      `https://gateway.irys.xyz/mutable/${review.review_txid}`
    );

    console.log("Review data raw:", review_data_raw);
    let review_data: ReviewData = {
      relevance: QualityFactorAnswer.NO,
      technical_correctness: QualityFactorAnswer.NO,
      completeness: QualityFactorAnswer.NO,
      clarity: QualityFactorAnswer.NO,
      originality: QualityFactorAnswer.NO,
      unbiased: QualityFactorAnswer.NO,
      plagiarism_free: QualityFactorAnswer.NO,
      suggested_difficulty: ChallengeDifficultyLevel.EASY,
      suggested_category: Domain.COMPUTER_SCIENCE_FUNDAMENTALS,
      suggested_solve_time: 0,
    };

    if (
      typeof review_data_raw === "string"
        ? review_data_raw.trim() !== ""
        : review_data_raw && Object.keys(review_data_raw).length > 0
    ) {
      review_data = {
        relevance: Number(review_data_raw.relevance) as QualityFactorAnswer,
        technical_correctness: Number(
          review_data_raw.technical_correctness
        ) as QualityFactorAnswer,
        completeness: Number(
          review_data_raw.completeness
        ) as QualityFactorAnswer,
        clarity: Number(review_data_raw.clarity) as QualityFactorAnswer,
        originality: Number(review_data_raw.originality) as QualityFactorAnswer,
        unbiased: Number(review_data_raw.unbiased) as QualityFactorAnswer,
        plagiarism_free: Number(
          review_data_raw.plagiarism_free
        ) as QualityFactorAnswer,
        suggested_difficulty: Number(
          review_data_raw.suggested_difficulty
        ) as ChallengeDifficultyLevel,
        suggested_category: Number(
          review_data_raw.suggested_category
        ) as Domain,
        suggested_solve_time: Number(review_data_raw.suggested_solve_time),
      };
    }

    // Build a strongly-typed ModeratorReview object to force TS validation
    const moderatorReview: ModeratorReview = {
      moderator: review.moderator as string,
      challenge_id: Number(review.challenge_id),
      review_time: Number(review.review_time),
      review_txid: review.review_txid as string,
      is_submitted: review.is_submitted as boolean,
      relevance: review_data.relevance,
      technical_correctness: review_data.technical_correctness,
      completeness: review_data.completeness,
      clarity: review_data.clarity,
      originality: review_data.originality,
      unbiased: review_data.unbiased,
      plagiarism_free: review_data.plagiarism_free,
      suggested_difficulty: review_data.suggested_difficulty,
      suggested_category: review_data.suggested_category,
      suggested_solve_time: review_data.suggested_solve_time,
      review_score: Number(review.review_score),
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
        completed: challenge.completed,
      };
    })
  );

  return challengesWithMeaningfulData;
};

export const fetchPendingChallenges = async (): Promise<
  ChallengeInterface[]
> => {
  const pendingChallenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getPendingChallenges",
    args: [],
  });

  const meaningPendingChallenges = await Promise.all(
    (pendingChallenges as any[]).map(async (challenge) => {
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
        completed: challenge.completed,
      };
    })
  );

  return meaningPendingChallenges;
};

export const fetchApprovedChallenges = async (): Promise<
  ChallengeInterface[]
> => {
  const approvedChallenges = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getApprovedChallenges",
    args: [],
  });

  const meaningApprovedChallenges = await Promise.all(
    (approvedChallenges as any[]).map(async (challenge) => {
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
        completed: challenge.completed,
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
        completed: challenge.completed,
      };
    })
  );

  return meaningJoinedChallenges;
};

export const fetchJoinedChallengesPreviewByUser = async (
  address: `0x${string}`
): Promise<JoinedChallengePreview[]> => {
  const previewList = await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getJoinedChallengesByUserForPreview",
    args: [address],
  });

  const meaningPreviewList = await Promise.all(
    (previewList as any[]).map(async (preview) => {
      const title = await fetchStringDataOffChain(preview.title_url);
      const description = await fetchStringDataOffChain(
        preview.description_url
      );

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
};

export const fetchUserHasJoinedChallengeState = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<boolean> => {
  const has_joined = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "checkUserJoinedChallenge",
    args: [address, challenge_id],
  })) as boolean;

  return has_joined;
};

export const fetchSolutionTxIdByUserAndChallengeId = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<string> => {
  const fetchedTxId = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getSolutionTxId",
    args: [address, challenge_id],
  })) as string;

  return fetchedTxId;
};

export const fetchModeratorReviewTxIdByModeratorAndChallengeId = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<string> => {
  const fetchedTxId = (await readContract(wagmiConfig, {
    address: ContractConfig_ChallengeManager.address as `0x${string}`,
    abi: ContractConfig_ChallengeManager.abi,
    functionName: "getModeratorReviewTxId",
    args: [address, challenge_id],
  })) as string;

  return fetchedTxId;
};

export const fetchSolutionByUserAndChallengeId = async (
  address: `0x${string}`,
  challenge_id: number
): Promise<SolutionInterface | null> => {
  const fetchedSolution = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getSolutionByUserAndChallengeId",
    args: [address, challenge_id],
  })) as any;

  if (!fetchedSolution) return null;

  const solution = await fetchStringDataOffChain(
    `https://gateway.irys.xyz/mutable/${fetchedSolution.solution_txid}`
  );

  return {
    solutionId: fetchedSolution.id,
    user: fetchedSolution.user,
    challengeId: fetchedSolution.challenge_id,
    solution: solution,
    createdAt: fetchedSolution.created_at,
    submittedAt: fetchedSolution.submitted_at,
    progress: fetchedSolution.progress,
    score: fetchedSolution.score,
  };
};

export const fetchSolutionById = async (
  solution_id: number
): Promise<SolutionInterface | null> => {
  const fetchedSolution = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getSolutionById",
    args: [solution_id],
  })) as any;

  if (!fetchedSolution) return null;

  const solution = await fetchStringDataOffChain(
    `https://gateway.irys.xyz/mutable/${fetchedSolution.solution_txid}`
  );

  return {
    solutionId: fetchedSolution.id,
    user: fetchedSolution.user,
    challengeId: fetchedSolution.challenge_id,
    solution: solution,
    createdAt: fetchedSolution.created_at,
    submittedAt: fetchedSolution.submitted_at,
    progress: fetchedSolution.progress,
    score: fetchedSolution.score,
  };
};

export const fetchUserReputationScore = async (address: `0x${string}`) => {
  const global_reputation = (await readContract(wagmiConfig, {
    address: ContractConfig_ReputationManager.address as `0x${string}`,
    abi: ContractConfig_ReputationManager.abi,
    functionName: "getGlobalReputation",
    args: [address],
  })) as number | bigint;

  const domain_reputation = (await readContract(wagmiConfig, {
    address: ContractConfig_ReputationManager.address as `0x${string}`,
    abi: ContractConfig_ReputationManager.abi,
    functionName: "getAllDomainReputation",
    args: [address],
  })) as number[];

  return {
    global_reputation: Number(global_reputation),
    domain_reputation: domain_reputation.map((score) => Number(score)),
  };
};

export const fetchUnderReviewSolutionsPreview = async (): Promise<
  UnderReviewSolutionPreview[]
> => {
  const underReviewSolutions = await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getUnderReviewSolutionPreview",
    args: [],
  });

  const meaningUnderReviewSolutions = await Promise.all(
    (underReviewSolutions as any[]).map(async (solution) => {
      const challengeTitle = await fetchStringDataOffChain(
        solution.challenge_title_url
      );
      const solutionContent = await fetchStringDataOffChain(
        `https://gateway.irys.xyz/mutable/${solution.solution_txid}`
      );

      return {
        solutionId: solution.id,
        submitter: solution.submitter,
        challengeTitle: challengeTitle,
        category: solution.domain.toString(),
        solution: solutionContent,
        submittedAt: solution.submitted_at,
        progress: solution.progress,
        numberOfEvaluators: solution.number_of_joined_evaluators,
        totalEvaluators: solution.total_evaluators,
      };
    })
  );

  return meaningUnderReviewSolutions;
};

export const fetchUnderReviewSolutionsPreviewByEvaluator = async (
  address: `0x${string}`
): Promise<UnderReviewSolutionPreview[]> => {
  const underReviewSolutions = await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getSolutionByEvaluator",
    args: [address],
  });

  const meaningUnderReviewSolutions = await Promise.all(
    (underReviewSolutions as any[]).map(async (solution) => {
      const challengeTitle = await fetchStringDataOffChain(
        solution.challenge_title_url
      );
      const solutionContent = await fetchStringDataOffChain(
        `https://gateway.irys.xyz/mutable/${solution.solution_txid}`
      );

      return {
        solutionId: solution.id,
        submitter: solution.submitter,
        challengeTitle: challengeTitle,
        category: solution.domain.toString(),
        solution: solutionContent,
        submittedAt: solution.submitted_at,
        progress: solution.progress,
        numberOfEvaluators: solution.number_of_joined_evaluators,
        totalEvaluators: solution.total_evaluators,
      };
    })
  );

  return meaningUnderReviewSolutions;
};

export const fetchNumberOfJoinedEvaluatorsById = async (
  solution_id: number
): Promise<number> => {
  const numberOfEvaluators = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getNumberOfJoinedEvaluators",
    args: [solution_id],
  })) as number;

  return Number(numberOfEvaluators);
};

export const fetchNumberOfSubmittedEvaluationById = async (
  solution_id: number
): Promise<number> => {
  const numberOfSubmittedEvaluation = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getNumberOfSubmittedEvaluations",
    args: [solution_id],
  })) as number;

  return Number(numberOfSubmittedEvaluation);
};

export const fetchMaxEvaluatorsForSolutionById = async (
  solution_id: number
): Promise<number> => {
  const totalEvaluators = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "getMaxEvaluatorsForSolution",
    args: [solution_id],
  })) as number;

  return Number(totalEvaluators);
};

export const fetchTimestampEvaluationCompleted = async (
  solution_id: number
): Promise<number | undefined> => {
  try {
    const timestamp = (await readContract(wagmiConfig, {
      address: ContractConfig_SolutionManager.address as `0x${string}`,
      abi: ContractConfig_SolutionManager.abi,
      functionName: "getTimestampEvaluationCompleted",
      args: [solution_id],
    })) as number;

    return Number(timestamp);
  } catch (error) {
    return undefined;
  }
};

export const fetchSolutionReviewPool = async (
  solution_id: number
): Promise<SolutionReviewPool | null> => {
  const solution = (await fetchSolutionById(solution_id)) as SolutionInterface;

  const [
    numberOfEvaluators,
    numberOfSubmittedEvaluation,
    totalEvaluators,
    timestamp,
  ] = await Promise.all([
    fetchNumberOfJoinedEvaluatorsById(solution_id),
    fetchNumberOfSubmittedEvaluationById(solution_id),
    fetchMaxEvaluatorsForSolutionById(solution_id),
    fetchTimestampEvaluationCompleted(solution_id),
  ]);

  return {
    solution: solution,
    numberOfEvaluators: numberOfEvaluators,
    numberOfSubmittedEvaluation: numberOfSubmittedEvaluation,
    totalEvaluators: totalEvaluators,
    completedAt: timestamp,
  };
};

export const fetchEvaluatorHasJoinedSolutionState = async (
  address: `0x${string}`,
  solution_id: number
): Promise<boolean> => {
  const has_joined = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "checkEvaluatorJoinedSolution",
    args: [address, solution_id],
  })) as boolean;

  return has_joined;
};

export const fetchEvaluatorHasSubmittedSolution = async (
  address: `0x${string}`,
  solution_id: number
): Promise<boolean> => {
  const has_submitted = (await readContract(wagmiConfig, {
    address: ContractConfig_SolutionManager.address as `0x${string}`,
    abi: ContractConfig_SolutionManager.abi,
    functionName: "checkEvalutorSubmittedScore",
    args: [address, solution_id],
  })) as boolean;

  return has_submitted;
};

export const fetchSubmittedEvaluationScore = async (
  address: `0x${string}`,
  solution_id: number
): Promise<number | undefined> => {
  try {
    const score = (await readContract(wagmiConfig, {
      address: ContractConfig_SolutionManager.address as `0x${string}`,
      abi: ContractConfig_SolutionManager.abi,
      functionName: "getScoreSubmittedByEvaluator",
      args: [address, solution_id],
    })) as number;

    return Number(score);
  } catch (error) {
    return undefined;
  }
};

export const fetchTimestampScoreSubmittedByEvaluator = async (
  address: `0x${string}`,
  solution_id: number
): Promise<number | undefined> => {
  try {
    const timestamp = (await readContract(wagmiConfig, {
      address: ContractConfig_SolutionManager.address as `0x${string}`,
      abi: ContractConfig_SolutionManager.abi,
      functionName: "getTimestampScoreSubmittedByEvaluator",
      args: [address, solution_id],
    })) as number;

    return Number(timestamp);
  } catch (error) {
    return undefined;
  }
};

export const fetchEvaluationForSolutionByEvaluator = async (
  address: `0x${string}`,
  solution_id: number
): Promise<EvaluationInterface> => {
  const [isSubmitted, score, timestamp] = await Promise.all([
    fetchEvaluatorHasSubmittedSolution(address, solution_id),
    fetchSubmittedEvaluationScore(address, solution_id),
    fetchTimestampScoreSubmittedByEvaluator(address, solution_id),
  ]);

  return {
    isSubmitted: isSubmitted,
    score: score,
    submittedAt: timestamp,
  };
};

export const fetchPreviewJobsByRecruiter = async (
  address: `0x${string}`
): Promise<JobPreviewInterface[]> => {
  // Call the contract function to get jobs by recruiter
  const rawJobs = await readContract(wagmiConfig, {
    address: ContractConfig_JobManager.address as `0x${string}`,
    abi: ContractConfig_JobManager.abi,
    functionName: "getJobsByRecruiter",
    args: [address],
  });

  console.log("Raw jobs data:", rawJobs);

  // Transform the raw jobs data into JobInterface format
  const jobs: JobPreviewInterface[] = await Promise.all(
    (rawJobs as any[]).map(async (job) => {
      // Fetch the job content from Irys using the content_id
      const jobContent = await fetchStringDataOffChain(
        `https://gateway.irys.xyz/mutable/${job.content_id}`
      ) as any;
      let duration: JobDuration = JobDuration.FULL_TIME; // Default to FULL_TIME
      
      try {
        if (jobContent && jobContent.duration !== undefined) {
          duration = Number(jobContent.duration) as JobDuration;
        }
      } catch (error) {
        console.error("Error parsing job duration:", error);
      }
      
      const preview_job_object: JobPreviewInterface = {
        id: job.id,
        title: jobContent?.title || "",
        location: jobContent?.location || "",
        duration: duration,
        applicants: jobContent?.applicants || 0, // TODO: Add real applicant number here
        posted: new Date(Number(job.created_at)),
        status: job.status,
      };

      return preview_job_object;
    })
  );

  return jobs;
};
