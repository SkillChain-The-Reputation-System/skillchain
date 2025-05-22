import { Domain, ChallengeStatus, QualityFactorAnswer, ChallengeDifficultyLevel, ChallengeSolutionProgress, JobStatus, JobDuration } from "@/constants/system";

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
    completed: number;
}

export interface JobPreviewInterface {
    id: string;
    title: string;
    location: string;
    duration: JobDuration;
    applicants: number;
    posted: Date;
    status: JobStatus;
}

export interface JobInterface {
    // Fields from JobPreviewInterface
    id: string;
    title: string;
    recruiter: string;
    location?: string; // Optional as in JobFormData
    duration: JobDuration;
    applicants: number;
    posted: Date;
    status: JobStatus;
    
    // Additional fields from JobFormData
    description: string;
    requirements: string;
    compensation: string;
    domains: Domain[]; // Domain enum values
    domainReputations: Record<Domain, number>;
    requireGlobalReputation: boolean;
    globalReputationScore?: number; // Optional
    deadline: number; // Epoch time in milliseconds
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
    review_score: number;
}

export interface SolutionInterface {
    solutionId: string;
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

export interface ReviewData {
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

export interface UnderReviewSolutionPreview {
    solutionId: string;
    submitter: string | undefined;
    challengeTitle: string | undefined;
    category: string | Domain;
    solution: string | undefined;
    submittedAt: number;
    progress: ChallengeSolutionProgress;
    numberOfEvaluators: number;
    totalEvaluators: number;
}

export interface SolutionReviewPool {
    solution: SolutionInterface;
    numberOfEvaluators: number;
    numberOfSubmittedEvaluation: number;
    totalEvaluators: number;
    completedAt: number | undefined;
}

export interface EvaluationInterface {
    isSubmitted: boolean;
    score: number | undefined;
    submittedAt: number | undefined;
}