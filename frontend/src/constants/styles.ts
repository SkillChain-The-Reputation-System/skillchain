import { ChallengeStatus } from "./system";

// Styles of status badge (light and dark mode)
export const statusStyles = {
  [ChallengeStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/30",
  [ChallengeStatus.APPROVED]:
    "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30",
  [ChallengeStatus.REJECTED]:
    "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/30",
};
