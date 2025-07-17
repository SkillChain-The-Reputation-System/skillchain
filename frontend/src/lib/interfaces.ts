import {
  Domain,
  ChallengeStatus,
  QualityFactorAnswer,
  ChallengeDifficultyLevel,
  ChallengeSolutionProgress,
  JobStatus,
  JobDuration,
  JobApplicationStatus,
  MeetingStatus,
} from "@/constants/system";

export interface UserProfileInterface {
  address: string;
  fullname: string;
  location: string;
  email: string;
  avatar_url: string;
  bio: string;
}

export interface RecruiterProfileInterface {
  // Recruiter info
  recruiter_address: string;
  recruiter_fullname: string;
  recruiter_email: string;
  recruiter_phone: string;
  recruiter_position: string;
  recruiter_bio: string;
  recruiter_avatar_url: string;
  // Company info
  company_name: string;
  company_website: string;
  company_location: string;
  company_industry: string;
  company_size: string;
  company_description: string;
}

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
  id: `0x${string}`;
  contributor: `0x${string}`;
  title: string;
  category: Domain;
  status: ChallengeStatus;
  bounty: number;
  description?: string;
  contributeAt?: number;  // Epoch Unix Timestamp (miliseconds)
  qualityScore?: number;
  difficultyLevel?: ChallengeDifficultyLevel;
  solveTime?: number;
  participants?: number;
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
  id: string;
  title: string;
  recruiter: string;
  location?: string; // Optional
  duration: JobDuration;
  applicants: number;
  posted: Date;
  status: JobStatus;
  description: string;
  requirements: string;
  compensation: string;
  domains: Domain[];
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
  suggested_solve_time: number;
  review_score: number;
}

export interface SolutionInterface {
  solutionId: `0x${string}`;
  user: `0x${string}`;
  challengeId: `0x${string}`;
  solution?: string;
  createdAt: number;
  submittedAt?: number; // Epoch Unix Timestamp (miliseconds)
  progress: ChallengeSolutionProgress;
  score?: number;
}

export interface BriefJoinedChallenge {
  challengeId: `0x${string}`;
  title: string;
  description: string;
  category: Domain;
  progress: ChallengeSolutionProgress;
  joinedAt: number; // Epoch Unix Timestamp (miliseconds)
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
  suggested_solve_time: number;
}

export interface BriefUnderReviewSolution {
  solutionId: `0x${string}`;
  submitter: `0x${string}`;
  challengeTitle: string;
  category: Domain;
  solution: string;
  submittedAt: number; // Epoch Unix Timestamp (miliseconds)
  progress: ChallengeSolutionProgress;
  numberOfEvaluators: number;
  totalEvaluators: number;
}

export interface SolutionReviewPool {
  solution: SolutionInterface;
  numberOfEvaluators: number;
  numberOfSubmittedEvaluation: number;
  totalEvaluators: number;
  completedAt?: number; // Epoch Unix Timestamp (miliseconds)
}

export interface EvaluationInterface {
  isSubmitted: boolean;
  score: number | undefined;
  submittedAt: number | undefined; // Epoch Unix Timestamp (miliseconds)
}

export interface BriefJobApplicationInterface {
  id: string;
  address: string;
  status: JobApplicationStatus;
  applied_at: number;
  job_id: string;
  profile_data: UserProfileInterface;
  reputation_data: UserReputationScoreInterface;
}

export interface JobApplicationInterface {
  id: string;
  applicant: string;
  applied_at: number;
  status: JobApplicationStatus;
  profile_data: UserProfileInterface;
  reputation_data: UserReputationScoreInterface;
  job: JobInterface;
}

export interface JobApplicationMetricsInterface {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  interviewed: number;
  rejected: number;
  withdrawn: number;
  hired: number;
}

export interface UserReputationScoreInterface {
  global_reputation: number;
  domain_reputation: Record<Domain, number>;
}

export interface UserRoleStatusInterface {
  reputation: number;
  can_be_contributor: boolean;
  can_be_evaluator: boolean;
  can_be_moderator: boolean;
  is_contributor: boolean;
  is_evaluator: boolean;
  is_moderator: boolean;
}

export interface DomainRoleStatusInterface {
  reputation: number;
  can_be_contributor: boolean;
  can_be_evaluator: boolean;
  can_be_moderator: boolean;
  is_contributor: boolean;
  is_evaluator: boolean;
  is_moderator: boolean;
}

export interface RoleRequirementsInterface {
  contributor_requirement: number;
  evaluator_requirement: number;
  moderator_requirement: number;
}

export interface BriefMeetingInterface {
  id: string;
  roomId: string;
  applicant: UserProfileInterface;
  job: {
    position: string;
    duration: JobDuration;
  };
  scheduledAt: number;
  endedAt: number;
  meetingDate: {
    date: Date;
    fromTime: string;
    toTime: string;
  };
  status: MeetingStatus;
  note: string | undefined;
}

export interface MeetingRoomInterface {
  id: string;
  roomId: string;
  application: JobApplicationInterface;
  scheduledAt: number;
  endedAt: number;
  date: Date;
  fromTime: string;
  toTime: string;
  status: MeetingStatus;
  note: string | undefined;
}

export interface ModeratorPotInfo {
  moderator: string;
  reward: number;
}

export interface ChallengePotInfoInterface {
  bounty: number;
  totalReward: number;
  isFinalized: boolean;
  moderators: ModeratorPotInfo[];
}

export interface EvaluatorPotInfo {
  evaluator: string;
  reward: number;
}

export interface SolutionPotInfoInterface {
  bounty: number;
  totalReward?: number;
  solver: string;
  isFinalized: boolean;
  evaluators: EvaluatorPotInfo[];
}

export interface TalentPaymentInfo {
  talent: string;
  amount: number;
}

export interface ChallengeRevenueInfoInterface {
  totalRevenue: number;
  payments: TalentPaymentInfo[];
}
