import {
  ChallengeStatus,
  ChallengeDifficultyLevel,
  ChallengeSolutionProgress,
  JobApplicationStatus,
  JobStatus,
  MeetingStatus
} from "./system";

/**
 * Styles of status on Badge Component (light and dark mode)
 **/
export const statusStyles = {
  [ChallengeStatus.DRAFT]: 
    "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  [ChallengeStatus.PENDING]:
    "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
  [ChallengeStatus.APPROVED]:
    "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200",
  [ChallengeStatus.REJECTED]:
    "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200",
};

export const difficultyStyles = {
  [ChallengeDifficultyLevel.EASY]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  [ChallengeDifficultyLevel.MEDIUM]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  [ChallengeDifficultyLevel.HARD]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

export const solutionProgressStyles = {
  [ChallengeSolutionProgress.IN_PROGRESS]: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [ChallengeSolutionProgress.SUBMITTED]: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  [ChallengeSolutionProgress.UNDER_REVIEW]: "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  [ChallengeSolutionProgress.REVIEWED]: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300",
}

export const applicationStatusStyles = {
  [JobApplicationStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  [JobApplicationStatus.REVIEWING]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  [JobApplicationStatus.SHORTLISTED]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",

  [JobApplicationStatus.INTERVIEWED]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  [JobApplicationStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  [JobApplicationStatus.WITHDRAWN]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
  [JobApplicationStatus.HIRED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
};

// Application status styles with hover effect
export const applicationStatusHoverStyles = {
  [JobApplicationStatus.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-800/40",
  [JobApplicationStatus.REVIEWING]: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/40",
  [JobApplicationStatus.SHORTLISTED]: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:hover:bg-indigo-800/40",
  [JobApplicationStatus.INTERVIEWED]: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:hover:bg-purple-800/40",
  [JobApplicationStatus.REJECTED]: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/40",
  [JobApplicationStatus.WITHDRAWN]: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-800/40",
  [JobApplicationStatus.HIRED]: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/40",
};

// Job status badge styles with light/dark mode
export const jobStatusStyles = {
  [JobStatus.OPEN]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  [JobStatus.PAUSED]: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  [JobStatus.CLOSED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  [JobStatus.FILLED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  [JobStatus.DRAFT]: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200",
  [JobStatus.ARCHIVED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
};

// Job status badge styles with light/dark mode and hover effects
export const jobStatusHoverStyles = {
  [JobStatus.OPEN]: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-800/40",
  [JobStatus.PAUSED]: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/40",
  [JobStatus.CLOSED]: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/40",
  [JobStatus.FILLED]: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/40",
  [JobStatus.DRAFT]: "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900/30 dark:text-slate-200 dark:hover:bg-slate-800/40",
  [JobStatus.ARCHIVED]: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:bg-gray-800/40",
};

// Application status icon styles using 500 shade color variants
export const applicationStatusIconStyles = {
  [JobApplicationStatus.PENDING]: "text-yellow-500",
  [JobApplicationStatus.REVIEWING]: "text-blue-500",
  [JobApplicationStatus.SHORTLISTED]: "text-indigo-500",
  [JobApplicationStatus.INTERVIEWED]: "text-purple-500",
  [JobApplicationStatus.REJECTED]: "text-red-500",
  [JobApplicationStatus.WITHDRAWN]: "text-orange-500",
  [JobApplicationStatus.HIRED]: "text-green-500",
};

// Job status icon styles using 500 shade color variants
export const jobStatusIconStyles = {
  [JobStatus.OPEN]: "text-green-500",
  [JobStatus.PAUSED]: "text-amber-500",
  [JobStatus.CLOSED]: "text-red-500",
  [JobStatus.FILLED]: "text-blue-500",
  [JobStatus.DRAFT]: "text-slate-500",
  [JobStatus.ARCHIVED]: "text-gray-500",
};

export const meetingStatusStyles = {
  [MeetingStatus.PENDING]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/30",
  [MeetingStatus.COMPLETED]: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30",
  [MeetingStatus.CANCELLED]: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/30"
}

/**
 * Fill color on Interfaces in system.ts for Chart
 **/

export const jobStatusChartColor = {
  [JobStatus.OPEN]: "var(--color-green-500)",
  [JobStatus.PAUSED]: "var(--color-amber-400)",
  [JobStatus.CLOSED]: "var(--color-red-600)",
  [JobStatus.FILLED]: "var(--color-blue-600)",
  [JobStatus.DRAFT]: "var(--color-slate-400)",
  [JobStatus.ARCHIVED]: "var(--color-gray-600)",
}

export const applicationStatusChartColor = {
  [JobApplicationStatus.PENDING]: "var(--color-yellow-500)",
  [JobApplicationStatus.REVIEWING]: "var(--color-blue-600)",
  [JobApplicationStatus.SHORTLISTED]: "var(--color-violet-500)",
  [JobApplicationStatus.INTERVIEWED]: "var(--color-purple-500)",
  [JobApplicationStatus.HIRED]: "var(--color-green-600)",
}

export const meetingStatusChartColor = {
  [MeetingStatus.PENDING]: "var(--color-yellow-500)",
  [MeetingStatus.COMPLETED]: "var(--color-green-600)",
  [MeetingStatus.CANCELLED]: "var(--color-red-600)"
}