import { Domain, ChallengeStatus, QualityFactorAnswer, ChallengeDifficultyLevel, ChallengeSolutionProgress } from "@/constants/system";

export interface IrysUploadResponseInterface {
    success: boolean;
    id: string | undefined;
    url: string | undefined;
}

export interface FetchUserDataOnChainOutput {
    username: string | undefined;
    avatar_url: string | undefined;
    bio_url: string | undefined;
}

export interface ChallengeInterface {
    id: string | undefined;
    contributor: string | undefined;
    title: string | undefined;
    description: string | undefined;
    category: string | Domain;
    contributeAt: number;
    status: string | ChallengeStatus;
    qualityScore: number;
    difficultyLevel: ChallengeDifficultyLevel;
    solveTime: number;
}

export interface GetCurrentTimeResponse {
    success: boolean;
    time: number;
}

export interface ModeratorReview {
    moderator: string;
    challenge_id: number;
    review_time: number;
    review_txid: string;
    is_submitted: boolean;
    relevance: QualityFactorAnswer;
    technical_correctness: QualityFactorAnswer;
    completeness: QualityFactorAnswer;
    clarity: QualityFactorAnswer;
    originality: QualityFactorAnswer;
    unbiased: QualityFactorAnswer;
    plagiarism_free: QualityFactorAnswer;
    suggested_difficulty: ChallengeDifficultyLevel;
    suggested_category: Domain;
    suggested_solve_time: number;
}

export interface SolutionInterface {
    user: string | undefined;
    challengeId: string | undefined;
    solution: string | undefined;
    createdAt: number;
    submittedAt: number;
    progress: ChallengeSolutionProgress;
    score: number;
}

export interface JoinedChallengePreview {
    challengeId: string;
    title: string | undefined;
    description: string | undefined;
    category: string | Domain;
    progress: ChallengeSolutionProgress;
    joinedAt: number;
    score: number;
}