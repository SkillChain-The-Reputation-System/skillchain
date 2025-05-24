export enum Domain {
  COMPUTER_SCIENCE_FUNDAMENTALS = 0,
  SOFTWARE_DEVELOPMENT = 1,
  SYSTEMS_AND_NETWORKING = 2,
  CYBERSECURITY = 3,
  DATA_SCIENCE_AND_ANALYTICS = 4,
  DATABASE_ADMINISTRATION = 5,
  QUALITY_ASSURANCE_AND_TESTING = 6,
  PROJECT_MANAGEMENT = 7,
  USER_EXPERIENCE_AND_DESIGN = 8,
  BUSINESS_ANALYSIS = 9,
  ARTIFICIAL_INTELLIGENCE = 10,
  BLOCKCHAIN_AND_CRYPTOCURRENCY = 11,
  NETWORK_ADMINISTRATION = 12,
  CLOUD_COMPUTING = 13,
}

export enum ChallengeStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export enum QualityFactorAnswer {
  NO = 0,
  YES = 1,
}

export enum ChallengeDifficultyLevel {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
}

export enum ChallengeSortOption {
  NEWEST = 0,
  QUALITY = 1,
  VOTES = 2,
  PARTICIPANTS = 3,
}

export enum ChallengeSolutionProgress {
  IN_PROGRESS = 0,
  SUBMITTED = 1,
  UNDER_REVIEW = 2,
  REVIEWED = 3,
}

export enum SolutionSortOption {
  NEWEST = 0,
  MOST_EVALUATORS = 1,
  LEAST_EVALUATORS = 2,
}

export enum JobStatus {
  DRAFT = 0,
  OPEN = 1,
  PAUSED = 2,
  CLOSED = 3,
  FILLED = 4,
  ARCHIVED = 5,
}

export enum JobDuration {
  FULL_TIME = 0,
  PART_TIME = 1,
  CONTRACT = 2,
  FREELANCE = 3,
}

export enum JobApplicationStatus {
  PENDING = 0,
  REVIEWING = 1,
  SHORTLISTED = 2,
  INTERVIEWING = 3,
  REJECTED = 4,
  WITHDRAWN = 5,
  HIRED = 6,
}


export const DomainLabels: Record<Domain, string> = {
  [Domain.COMPUTER_SCIENCE_FUNDAMENTALS]: "Computer Science Fundamentals",
  [Domain.SOFTWARE_DEVELOPMENT]: "Software Development",
  [Domain.SYSTEMS_AND_NETWORKING]: "Systems and Networking",
  [Domain.CYBERSECURITY]: "Cybersecurity",
  [Domain.DATA_SCIENCE_AND_ANALYTICS]: "Data Science and Analytics",
  [Domain.DATABASE_ADMINISTRATION]: "Database Administration",
  [Domain.QUALITY_ASSURANCE_AND_TESTING]: "Quality Assurance and Testing",
  [Domain.PROJECT_MANAGEMENT]: "Project Management",
  [Domain.USER_EXPERIENCE_AND_DESIGN]: "User Experience and Design",
  [Domain.BUSINESS_ANALYSIS]: "Business Analysis",
  [Domain.ARTIFICIAL_INTELLIGENCE]: "Artificial Intelligence",
  [Domain.BLOCKCHAIN_AND_CRYPTOCURRENCY]: "Blockchain and Cryptocurrency",
  [Domain.NETWORK_ADMINISTRATION]: "Network Administration",
  [Domain.CLOUD_COMPUTING]: "Cloud Computing",
};

export const ChallengeStatusLabels: Record<ChallengeStatus, string> = {
  [ChallengeStatus.PENDING]: "Pending",
  [ChallengeStatus.APPROVED]: "Approved",
  [ChallengeStatus.REJECTED]: "Rejected",
};

export const QualityFactorAnswerLabels: Record<QualityFactorAnswer, string> = {
  [QualityFactorAnswer.YES]: "Yes",
  [QualityFactorAnswer.NO]: "No",
};

export const ChallengeDifficultyLevelLabels: Record<
  ChallengeDifficultyLevel,
  string
> = {
  [ChallengeDifficultyLevel.EASY]: "Easy",
  [ChallengeDifficultyLevel.MEDIUM]: "Medium",
  [ChallengeDifficultyLevel.HARD]: "Hard",
};

export const ChallengeSortOptionLabels: Record<ChallengeSortOption, string> = {
  [ChallengeSortOption.NEWEST]: "Newest First",
  [ChallengeSortOption.QUALITY]: "Highest Quality",
  [ChallengeSortOption.VOTES]: "Most Votes",
  [ChallengeSortOption.PARTICIPANTS]: "Most Participants",
};

export const ChallengeSolutionProgressLabels: Record<
  ChallengeSolutionProgress,
  string
> = {
  [ChallengeSolutionProgress.IN_PROGRESS]: "In Progress",
  [ChallengeSolutionProgress.SUBMITTED]: "Submitted",
  [ChallengeSolutionProgress.UNDER_REVIEW]: "Under Review",
  [ChallengeSolutionProgress.REVIEWED]: "Reviewed",
};

export const SolutionSortOptionLabels: Record<SolutionSortOption, string> = {
  [SolutionSortOption.NEWEST]: "Newest First",
  [SolutionSortOption.MOST_EVALUATORS]: "Most Evaluators",
  [SolutionSortOption.LEAST_EVALUATORS]: "Least Evaluators",
};

export const JobDurationLabels: Record<JobDuration, string> = {
  [JobDuration.FULL_TIME]: "Full Time",
  [JobDuration.PART_TIME]: "Part Time",
  [JobDuration.CONTRACT]: "Contract",
  [JobDuration.FREELANCE]: "Freelance"
};

export const JobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: "Draft",
  [JobStatus.OPEN]: "Open",
  [JobStatus.PAUSED]: "Paused",
  [JobStatus.CLOSED]: "Closed",
  [JobStatus.FILLED]: "Filled",
  [JobStatus.ARCHIVED]: "Archived",
};

export const ApplicationStatusLabels: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.PENDING]: "Pending",
  [JobApplicationStatus.REVIEWING]: "Reviewing",
  [JobApplicationStatus.SHORTLISTED]: "Shortlisted",
  [JobApplicationStatus.INTERVIEWING]: "Interviewing",
  [JobApplicationStatus.REJECTED]: "Rejected",
  [JobApplicationStatus.WITHDRAWN]: "Withdrawn",
  [JobApplicationStatus.HIRED]: "Hired",
};
