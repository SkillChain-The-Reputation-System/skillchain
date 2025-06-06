// filepath: d:\Hai_Tuyen\thesis\skillchain\frontend\src\lib\fetching-onchain-data-utils.ts
import { readContract } from "@wagmi/core";
import { formatEther } from "viem";
import {
  ContractConfig_ChallengeManager,
  ContractConfig_UserDataManager,
  ContractConfig_SolutionManager,
  ContractConfig_JobManager,
  ContractConfig_JobApplicationManager,
  ContractConfig_MeetingManager,
  ContractConfig_ModerationEscrow,
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
  JobInterface,
  JobApplicationInterface,
  BriefJobApplicationInterface,
  BriefMeetingInterface,
  MeetingRoomInterface,
  JobApplicationMetricsInterface,
  ChallengePotInfoInterface,
  ModeratorPotInfo,
} from "./interfaces";
import {
  fetchJsonDataOffChain,
  fetchStringDataOffChain,
} from "./fetching-offchain-data-utils";
import { getUserProfileData } from "./get/get-user-data-utils";
import { getUserReputationScore } from "./get/get-reputation-score-utils";
import {
  QualityFactorAnswer,
  ChallengeDifficultyLevel,
  Domain,
  JobDurationLabels,
  JobDuration,
  JobStatus,
  JobApplicationStatus,
} from "@/constants/system";
import { Meie_Script } from "next/font/google";

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

export const getChallengePotInfo = async (
  challenge_id: number
): Promise<ChallengePotInfoInterface> => {
  const [bountyRaw, totalRewardRaw, moderators, isDistributed] = await Promise.all([
    readContract(wagmiConfig, {
      address: ContractConfig_ModerationEscrow.address as `0x${string}`,
      abi: ContractConfig_ModerationEscrow.abi,
      functionName: "getBounty",
      args: [challenge_id],
    }),
    readContract(wagmiConfig, {
      address: ContractConfig_ModerationEscrow.address as `0x${string}`,
      abi: ContractConfig_ModerationEscrow.abi,
      functionName: "getTotalReward",
      args: [challenge_id],
    }),
    readContract(wagmiConfig, {
      address: ContractConfig_ModerationEscrow.address as `0x${string}`,
      abi: ContractConfig_ModerationEscrow.abi,
      functionName: "getModerators",
      args: [challenge_id],
    }),
    readContract(wagmiConfig, {
      address: ContractConfig_ModerationEscrow.address as `0x${string}`,
      abi: ContractConfig_ModerationEscrow.abi,
      functionName: "isDistributed",
      args: [challenge_id],
    }),
  ]);

  const moderatorsInfo: ModeratorPotInfo[] = await Promise.all(
    (moderators as string[]).map(async (moderator) => {
      const [stakeRaw, rewardRaw, penaltyRaw] = await Promise.all([
        readContract(wagmiConfig, {
          address: ContractConfig_ModerationEscrow.address as `0x${string}`,
          abi: ContractConfig_ModerationEscrow.abi,
          functionName: "getModeratorStake",
          args: [challenge_id, moderator],
        }),
        readContract(wagmiConfig, {
          address: ContractConfig_ModerationEscrow.address as `0x${string}`,
          abi: ContractConfig_ModerationEscrow.abi,
          functionName: "getModeratorReward",
          args: [challenge_id, moderator],
        }),
        readContract(wagmiConfig, {
          address: ContractConfig_ModerationEscrow.address as `0x${string}`,
          abi: ContractConfig_ModerationEscrow.abi,
          functionName: "getModeratorPenalty",
          args: [challenge_id, moderator],
        }),
      ]);

      const stake = parseFloat(formatEther(BigInt(stakeRaw as number)));
      const reward = parseFloat(formatEther(BigInt(rewardRaw as number )));
      const penalty = parseFloat(formatEther(BigInt(penaltyRaw as number)));

      return {
        moderator: moderator as string,
        stake,
        reward,
        penalty,
        remaining: stake + reward - penalty,
      } as ModeratorPotInfo;
    })
  );

  return {
    bounty: parseFloat(formatEther(BigInt(bountyRaw as number))),
    totalReward: parseFloat(formatEther(BigInt(totalRewardRaw as number))),
    isFinalized: isDistributed as boolean,
    moderators: moderatorsInfo,
  };
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
export const fetchJobContentID = async (job_id: string): Promise<string> => {
  try {
    const content_id = await readContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName: "getJobContentID",
      args: [job_id],
    });

    return content_id as string;
  } catch (error) {
    console.error("Error fetching job content ID:", error);
    throw error;
  }
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
      const jobContent = (await fetchStringDataOffChain(
        `https://gateway.irys.xyz/mutable/${job.content_id}`
      )) as any;
      let duration: JobDuration = JobDuration.FULL_TIME; // Default to FULL_TIME

      try {
        if (jobContent && jobContent.duration !== undefined) {
          duration = Number(jobContent.duration) as JobDuration;
        }
      } catch (error) {
        console.error("Error parsing job duration:", error);
      }

      const applicationCount = await fetchApplicationCountByJobID(job.id);

      const preview_job_object: JobPreviewInterface = {
        id: job.id,
        title: jobContent?.title || "",
        location: jobContent?.location || "",
        duration: duration,
        applicants: applicationCount,
        posted: new Date(Number(job.created_at)),
        status: job.status,
      };

      return preview_job_object;
    })
  );

  return jobs;
};

export const fetchJobById = async (
  job_id: string
): Promise<JobInterface | null> => {
  try {
    // Call the contract function to get job by ID
    const job = (await readContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName: "getJob",
      args: [job_id],
    })) as any;

    if (!job) return null;

    // Fetch the job content from Irys using the content_id
    const jobContent = (await fetchStringDataOffChain(
      `https://gateway.irys.xyz/mutable/${job.content_id}`
    )) as any;

    if (!jobContent) return null;

    // Default to FULL_TIME if duration is not provided
    let duration: JobDuration = JobDuration.FULL_TIME;
    try {
      if (jobContent.duration !== undefined) {
        duration = Number(jobContent.duration) as JobDuration;
      }
    } catch (error) {
      console.error("Error parsing job duration:", error);
    }

    // Fetch the application count for this job
    const applicationCount = await fetchApplicationCountByJobID(job_id);

    // Map the smart contract job and Irys content to JobInterface
    const jobDetails: JobInterface = {
      id: job.id,
      title: jobContent.title || "",
      recruiter: job.recruiter,
      location: jobContent.location || "",
      duration: duration,
      applicants: applicationCount,
      posted: new Date(Number(job.created_at)),
      status: job.status,
      // Additional fields from JobFormData
      description: jobContent.description || "",
      requirements: jobContent.requirements || "",
      compensation: jobContent.compensation || "",
      domains: jobContent.domains || [],
      domainReputations: jobContent.domainReputations || {},
      requireGlobalReputation: jobContent.requireGlobalReputation || false,
      globalReputationScore: jobContent.globalReputationScore,
      deadline: jobContent.deadline || 0,
    };

    return jobDetails;
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    return null;
  }
};

/**
 * Get possible job status transitions from current status
 * @param status The current job status
 * @returns An array of possible job statuses that can be transitioned to
 */
export const getPossibleJobStatusTransitions = async (
  status: JobStatus
): Promise<JobStatus[]> => {
  try {
    const possibleStatuses = await readContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName: "getPossibleStatusTransitions",
      args: [status],
    });

    return possibleStatuses as JobStatus[];
  } catch (error) {
    console.error("Error fetching possible job status transitions:", error);
    return [];
  }
};

/**
 * Fetch the current status of a job
 * @param jobId The job ID
 * @returns The current job status or undefined if there's an error
 */
export const fetchJobStatus = async (
  jobId: string
): Promise<JobStatus | undefined> => {
  try {
    const job = (await readContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName: "getJob",
      args: [jobId],
    })) as any;

    return job?.status;
  } catch (error) {
    console.error("Error fetching job status:", error);
    return undefined;
  }
};

/**
 * Fetch all open jobs
 * @returns An array of all open jobs
 */
export const fetchAllOpenJobs = async (): Promise<JobInterface[]> => {
  try {
    // Call the contract function to get all open jobs
    const rawJobs = await readContract(wagmiConfig, {
      address: ContractConfig_JobManager.address as `0x${string}`,
      abi: ContractConfig_JobManager.abi,
      functionName: "getAllOpenJobs",
      args: [],
    });

    // Transform the raw jobs data into JobInterface format
    const jobs: JobInterface[] = await Promise.all(
      (rawJobs as any[]).map(async (job) => {
        // Fetch the job content from Irys using the content_id
        const jobContent = (await fetchStringDataOffChain(
          `https://gateway.irys.xyz/mutable/${job.content_id}`
        )) as any;

        if (!jobContent) {
          // Return a minimal job object if content can't be fetched
          return {
            id: job.id,
            title: "",
            recruiter: job.recruiter,
            duration: JobDuration.FULL_TIME,
            applicants: 0,
            posted: new Date(Number(job.created_at)),
            status: job.status,
            description: "",
            requirements: "",
            compensation: "",
            domains: [],
            domainReputations: {} as Record<Domain, number>,
            requireGlobalReputation: false,
            deadline: 0,
            application_count: 0,
          };
        }

        // Default to FULL_TIME if duration is not provided
        let duration: JobDuration = JobDuration.FULL_TIME;
        try {
          if (jobContent.duration !== undefined) {
            duration = Number(jobContent.duration) as JobDuration;
          }
        } catch (error) {
          console.error("Error parsing job duration:", error);
        } // Fetch the application count for this job
        const applicationCount = await fetchApplicationCountByJobID(job.id);

        // Map the smart contract job and Irys content to JobInterface
        const jobDetails: JobInterface = {
          id: job.id,
          title: jobContent.title || "",
          recruiter: job.recruiter,
          location: jobContent.location || "",
          duration: duration,
          applicants: applicationCount,
          posted: new Date(Number(job.created_at)),
          status: job.status,
          // Additional fields from JobFormData
          description: jobContent.description || "",
          requirements: jobContent.requirements || "",
          compensation: jobContent.compensation || "",
          domains: jobContent.domains || [],
          domainReputations: jobContent.domainReputations || {},
          requireGlobalReputation: jobContent.requireGlobalReputation || false,
          globalReputationScore: jobContent.globalReputationScore,
          deadline: jobContent.deadline || 0,
        };

        return jobDetails;
      })
    );

    return jobs;
  } catch (error) {
    console.error("Error fetching all open jobs:", error);
    return [];
  }
};

export const fetchJobsNotAppliedByUser = async (
  address: `0x${string}`
): Promise<JobInterface[]> => {
  try {
    // Step 1: Fetch all open jobs
    const allOpenJobs = await fetchAllOpenJobs();

    // Step 2: Fetch all applications submitted by the user
    const userApplications = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplicationsByApplicant",
      args: [address],
    })) as any[];

    // Extract job IDs from user applications
    const appliedJobIds = new Set(userApplications.map((app) => app.job_id));

    // Step 3: Filter out jobs that the user has already applied for
    const unappliedJobs = allOpenJobs.filter(
      (job) => !appliedJobIds.has(job.id)
    );

    console.log(
      `User ${address} has not applied for ${unappliedJobs.length} out of ${allOpenJobs.length} open jobs`
    );

    return unappliedJobs;
  } catch (error) {
    console.error("Error fetching jobs not applied by user:", error);
    return [];
  }
};

export const fetchJobAppliedByUser = async (
  address: `0x${string}`
): Promise<JobInterface[]> => {
  try {
    // Step 1: Fetch all job IDs that the user has applied to
    const jobIds = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getJobIDsAppliedByUser",
      args: [address],
    })) as string[];

    // Step 2: Fetch detailed information for each job
    const jobDetailsPromises = jobIds.map((job_id) => fetchJobById(job_id));
    const jobDetails = await Promise.all(jobDetailsPromises);

    // Step 3: Filter out null values (jobs that couldn't be fetched)
    const validJobs = jobDetails.filter(
      (job) => job !== null
    ) as JobInterface[];

    console.log(`User ${address} has applied for ${validJobs.length} jobs`);

    return validJobs;
  } catch (error) {
    console.error("Error fetching jobs applied by user:", error);
    return [];
  }
};

export const fetchJobApplicationsByUser = async (
  address: `0x${string}`
): Promise<JobApplicationInterface[]> => {
  try {
    // Step 1: Fetch all applications submitted by the user from the smart contract
    const applications = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplicationsByApplicant",
      args: [address],
    })) as any[];

    if (!applications || applications.length === 0) {
      console.log(`User ${address} has no job applications`);
      return [];
    }

    // Step 2: Fetch the full job details for each application and map to JobApplicationInterface
    const jobApplicationsPromises = applications.map(async (application) => {
      const applicantAddress = application.applicant as `0x${string}`;

      // Fetch job details, profile data, and reputation data concurrently
      const [jobDetails, profileData, reputationData] = await Promise.all([
        fetchJobById(application.job_id),
        getUserProfileData(applicantAddress),
        getUserReputationScore(applicantAddress)
      ]);

      if (!jobDetails) {
        console.error(
          `Could not fetch job details for job ID: ${application.job_id}`
        );
        return null;
      }

      // Map the application data to the JobApplicationInterface
      const jobApplication: JobApplicationInterface = {
        id: application.id,
        applicant: application.applicant,
        applied_at: Number(application.applied_at),
        status: application.status,
        profile_data: profileData || {
          address: applicantAddress,
          fullname: '',
          location: '',
          email: '',
          avatar_url: '',
          bio: ''
        },
        reputation_data: reputationData || {
          global_reputation: 0,
          domain_reputation: {} as Record<Domain, number>
        },
        job: jobDetails,
      };

      return jobApplication;
    });

    // Wait for all job fetching promises to resolve
    const jobApplications = await Promise.all(jobApplicationsPromises);

    // Filter out any null values (applications where we couldn't fetch the job details)
    const validJobApplications = jobApplications.filter(
      (application): application is JobApplicationInterface =>
        application !== null
    );

    console.log(
      `Successfully fetched ${validJobApplications.length} job applications for user ${address}`
    );

    return validJobApplications;
  } catch (error) {
    console.error("Error fetching job applications by user:", error);
    return [];
  }
};

export const fetchJobApplicationByID = async (
  id: string
): Promise<JobApplicationInterface | null> => {
  try {
    // Step 1: Call the getApplication method in smart contract to fetch application details
    const application = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplication",
      args: [id],
    })) as any;

    if (!application || !application.id) {
      console.log(`Application with ID ${id} not found`);
      return null;
    }

    // Step 2: Fetch job details, profile data, and reputation data concurrently
    const applicantAddress = application.applicant as `0x${string}`;

    const [jobDetails, profileData, reputationData] = await Promise.all([
      fetchJobById(application.job_id),
      getUserProfileData(applicantAddress),
      getUserReputationScore(applicantAddress)
    ]);

    if (!jobDetails) {
      console.error(
        `Could not fetch job details for job ID: ${application.job_id}`
      );
      return null;
    }

    // Step 3: Process and return the JobApplicationInterface object
    const jobApplication: JobApplicationInterface = {
      id: application.id,
      applicant: application.applicant,
      applied_at: Number(application.applied_at),
      status: application.status,
      profile_data: profileData || {
        address: applicantAddress,
        fullname: '',
        location: '',
        email: '',
        avatar_url: '',
        bio: ''
      },
      reputation_data: reputationData || {
        global_reputation: 0,
        domain_reputation: {} as Record<Domain, number>
      },
      job: jobDetails,
    };

    console.log(`Successfully fetched job application with ID: ${id}`);

    return jobApplication;
  } catch (error) {
    console.error("Error fetching job application by ID:", error);
    return null;
  }
};

/**
 * Fetch the number of applications for a specific job
 * @param job_id The ID of the job
 * @returns The number of applications for the job
 */
export const fetchApplicationCountByJobID = async (
  job_id: string
): Promise<number> => {
  try {
    const count = await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplicationCount",
      args: [job_id],
    });

    return Number(count);
  } catch (error) {
    console.error("Error fetching application count:", error);
    return 0;
  }
};

/**
 * Fetch all applicants for a specific job
 * @param job_id The ID of the job
 * @returns Array of applicant details
 */
export const fetchBriefApplicationByJobID = async (
  job_id: string
): Promise<BriefJobApplicationInterface[]> => {
  try {
    // Step 1: Call the contract function to get applications for the job
    const applications = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplicationsByJob",
      args: [job_id],
    })) as any[];

    console.log(
      `Fetched ${applications.length} applications for job ${job_id}`
    );

    // Step 2: Transform contract data and fetch additional profile and reputation data
    const applicants: BriefJobApplicationInterface[] = await Promise.all(
      applications.map(async (application) => {
        const applicantAddress = application.applicant as `0x${string}`;

        // Fetch profile data and reputation data concurrently
        const [profileData, reputationData] = await Promise.all([
          getUserProfileData(applicantAddress),
          getUserReputationScore(applicantAddress)
        ]);

        return {
          id: application.id, // Use application ID as the unique identifier
          address: application.applicant, // Applicant's address
          status: application.status, // Application status
          applied_at: Number(application.applied_at), // Convert to number if it's returned as a BigInt
          job_id: application.job_id, // Job ID
          profile_data: profileData || {
            address: applicantAddress,
            fullname: '',
            location: '',
            email: '',
            avatar_url: '',
            bio: ''
          }, // Use empty profile if not found
          reputation_data: reputationData || {
            global_reputation: 0,
            domain_reputation: {} as Record<Domain, number>
          } // Use empty reputation if not found
        };
      })
    );

    return applicants;
  } catch (error) {
    console.error("Error fetching applicants by job ID:", error);
    return [];
  }
};

/**
 * Get possible job application status transitions from current status
 * @param status The current job application status
 * @returns An array of possible job application statuses that can be transitioned to
 */
export async function fetchPossibleApplicationStatusTransitions(
  status: JobApplicationStatus
): Promise<JobApplicationStatus[]> {
  try {
    const possibleStatuses = await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getValidApplicationStatusTransitions",
      args: [status],
    });

    return possibleStatuses as JobApplicationStatus[];
  } catch (error) {
    console.error(
      "Error fetching possible application status transitions:",
      error
    );
    return [];
  }
}

/**
 * Fetch all application counts for a specific job in a single operation
 * @param job_id The ID of the job
 * @returns Object containing counts for each application status
 */
export const fetchAllApplicationCountsByJobID = async (
  job_id: string
): Promise<JobApplicationMetricsInterface> => {
  try {
    // Get all applications for the job in a single contract call
    const applications = (await readContract(wagmiConfig, {
      address: ContractConfig_JobApplicationManager.address as `0x${string}`,
      abi: ContractConfig_JobApplicationManager.abi,
      functionName: "getApplicationsByJob",
      args: [job_id],
    })) as any[];

    // Initialize counters for each status
    const counts: JobApplicationMetricsInterface = {
      total: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      rejected: 0,
      withdrawn: 0,
      hired: 0,
    };

    // Count applications by status
    applications.forEach((application) => {
      switch (application.status) {
        case JobApplicationStatus.PENDING:
          counts.pending++;
          break;
        case JobApplicationStatus.REVIEWING:
          counts.reviewing++;
          break;
        case JobApplicationStatus.SHORTLISTED:
          counts.shortlisted++;
          break;
        case JobApplicationStatus.INTERVIEWED:
          counts.interviewed++;
          break;
        case JobApplicationStatus.REJECTED:
          counts.rejected++;
          break;
        case JobApplicationStatus.WITHDRAWN:
          counts.withdrawn++;
          break;
        case JobApplicationStatus.HIRED:
          counts.hired++;
          break;
      }
    });

    counts.total = applications.length;

    return counts;
  } catch (error) {
    console.error("Error fetching all application counts by job ID:", error);
    return {
      total: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      rejected: 0,
      withdrawn: 0,
      hired: 0,
    };
  }
};

/**
 * Following functions is for fetching meeting-related data on chain
 */
export async function fetchMeetingsByRecruiter(
  address: `0x${string}`
): Promise<BriefMeetingInterface[]> {
  try {
    const fetchedMeetings = (await readContract(wagmiConfig, {
      address: ContractConfig_MeetingManager.address as `0x${string}`,
      abi: ContractConfig_MeetingManager.abi,
      functionName: "getMeetingsByRecruiter",
      args: [address],
    })) as any[];

    const briefMeetingLists = await Promise.all(
      fetchedMeetings.map(async (fetchedMeeting) => {
        const [meetingData, application] = await Promise.all([
          await fetchStringDataOffChain(`https://gateway.irys.xyz/mutable/${fetchedMeeting.txid}`) as any,
          await fetchJobApplicationByID(fetchedMeeting.application_id) as JobApplicationInterface
        ])

        return {
          id: fetchedMeeting.id,
          roomId: meetingData.roomId,
          applicant: application.profile_data,
          job: {
            position: application.job.title,
            duration: application.job.duration,
          },
          scheduledAt: Number(fetchedMeeting.created_at),
          endedAt: Number(fetchedMeeting.ended_at),
          meetingDate: {
            date: meetingData.date,
            fromTime: meetingData.fromTime,
            toTime: meetingData.toTime,
          },
          status: fetchedMeeting.status,
          note: meetingData.note,
        } as BriefMeetingInterface
      })
    ) as BriefMeetingInterface[];

    return briefMeetingLists;
  }
  catch (error) {
    console.error(
      "Error fetching possible application status transitions:",
      error
    );
    return [];
  }
}

export async function fetchBriefMeetingByApplicationId(
  application_id: string
): Promise<BriefMeetingInterface | null> {
  try {
    const fetchedMeeting = (await readContract(wagmiConfig, {
      address: ContractConfig_MeetingManager.address as `0x${string}`,
      abi: ContractConfig_MeetingManager.abi,
      functionName: "getMeetingByApplication",
      args: [application_id],
    })) as any;

    const [meetingData, application] = await Promise.all([
      await fetchStringDataOffChain(`https://gateway.irys.xyz/mutable/${fetchedMeeting.txid}`) as any,
      await fetchJobApplicationByID(fetchedMeeting.application_id) as JobApplicationInterface
    ])

    return {
      id: fetchedMeeting.id,
      roomId: meetingData.roomId,
      applicant: application.profile_data,
      job: {
        position: application.job.title,
        duration: application.job.duration,
      },
      scheduledAt: Number(fetchedMeeting.created_at),
      endedAt: Number(fetchedMeeting.ended_at),
      meetingDate: {
        date: meetingData.date,
        fromTime: meetingData.fromTime,
        toTime: meetingData.toTime,
      },
      status: fetchedMeeting.status,
      note: meetingData.note,
    } as BriefMeetingInterface;
  }
  catch (error) {
    console.error(
      "Error fetching brief meeting by Application ID:",
      error
    );
    return null;
  }
}

export async function fetchMeetingRoomById(
  meeting_id: string
): Promise<MeetingRoomInterface | null> {
  try {
    const fetchedMeeting = (await readContract(wagmiConfig, {
      address: ContractConfig_MeetingManager.address as `0x${string}`,
      abi: ContractConfig_MeetingManager.abi,
      functionName: "getMeetingById",
      args: [meeting_id],
    })) as any;

    const [meetingData, application] = await Promise.all([
      await fetchStringDataOffChain(`https://gateway.irys.xyz/mutable/${fetchedMeeting.txid}`) as any,
      await fetchJobApplicationByID(fetchedMeeting.application_id) as JobApplicationInterface
    ])

    return {
      id: fetchedMeeting.id,
      roomId: meetingData.roomId,
      application: application,
      scheduledAt: Number(fetchedMeeting.created_at),
      endedAt: Number(fetchedMeeting.ended_at),
      date: meetingData.date,
      fromTime: meetingData.fromTime,
      toTime: meetingData.toTime,
      note: meetingData.note,
      status: fetchedMeeting.status,
    };
  }
  catch (error) {
    console.error(
      "Error fetching possible application status transitions:",
      error
    );
    return null;
  }
}


export async function fetchMeetingTxIdById(
  meeting_id: string
): Promise<string | null> {
  try {
    const fetchedTxId = (await readContract(wagmiConfig, {
      address: ContractConfig_MeetingManager.address as `0x${string}`,
      abi: ContractConfig_MeetingManager.abi,
      functionName: "getMeetingTxIdById",
      args: [meeting_id],
    })) as string;

    return fetchedTxId;
  }
  catch (error) {
    console.error(
      "Error fetching possible application status transitions:",
      error
    );
    return null;
  }
}

export async function fetchIsApplicationHasMeeting(
  application_id: string
): Promise<boolean> {
  const fetchedState = (await readContract(wagmiConfig, {
    address: ContractConfig_MeetingManager.address as `0x${string}`,
    abi: ContractConfig_MeetingManager.abi,
    functionName: "checkApplicationHasAMeeting",
    args: [application_id],
  })) as boolean;

  return fetchedState;
}