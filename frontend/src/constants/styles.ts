import {
  ChallengeStatus,
  ChallengeDifficultyLevel,
  ChallengeSolutionProgress
} from "./system";

// Styles of status badge (light and dark mode)
export const statusStyles = {
  [ChallengeStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/30",
  [ChallengeStatus.APPROVED]:
    "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30",
  [ChallengeStatus.REJECTED]:
    "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/30",
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