import { AccountButtonItem, NavItem } from "types";
import { pageUrlMapping } from "./navigation";
import { Domain, JobApplicationStatus, JobStatus } from "./system";

// Map each domain to its icon name
export const DomainIconMap: Record<number, string> = {
  [Domain.COMPUTER_SCIENCE_FUNDAMENTALS]: "Code",
  [Domain.SOFTWARE_DEVELOPMENT]: "Code2",
  [Domain.SYSTEMS_AND_NETWORKING]: "Server",
  [Domain.CYBERSECURITY]: "Shield",
  [Domain.DATA_SCIENCE_AND_ANALYTICS]: "BarChart2",
  [Domain.DATABASE_ADMINISTRATION]: "Database",
  [Domain.QUALITY_ASSURANCE_AND_TESTING]: "CheckCircle",
  [Domain.PROJECT_MANAGEMENT]: "ClipboardList",
  [Domain.USER_EXPERIENCE_AND_DESIGN]: "Layout",
  [Domain.BUSINESS_ANALYSIS]: "TrendingUp",
  [Domain.ARTIFICIAL_INTELLIGENCE]: "Cpu",
  [Domain.BLOCKCHAIN_AND_CRYPTOCURRENCY]: "Bitcoin",
  [Domain.NETWORK_ADMINISTRATION]: "Wifi",
  [Domain.CLOUD_COMPUTING]: "Cloud",
};

// Map application status to icon name
export const ApplicationStatusIconMap: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.PENDING]: "FileTextIcon",
  [JobApplicationStatus.REVIEWING]: "UserSearch",
  [JobApplicationStatus.SHORTLISTED]: "ListCheck",
  [JobApplicationStatus.INTERVIEWING]: "Calendar",
  [JobApplicationStatus.HIRED]: "CheckCircle",
  [JobApplicationStatus.REJECTED]: "XCircle",
  [JobApplicationStatus.WITHDRAWN]: "ArrowRight",
};

// Map job status to icon name
export const JobStatusIconMap: Record<JobStatus, string> = {
  [JobStatus.OPEN]: "CheckCircle",
  [JobStatus.PAUSED]: "PauseCircle",
  [JobStatus.CLOSED]: "XCircle",
  [JobStatus.FILLED]: "CheckIcon",
  [JobStatus.DRAFT]: "FileEdit",
  [JobStatus.ARCHIVED]: "ArchiveIcon",
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: "Overview",
    url: pageUrlMapping.dashboard_overview,
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Participation",
    url: pageUrlMapping.participation,
    icon: "participation",
    isActive: false,
    items: [
      {
        title: "Explore",
        url: pageUrlMapping.participation_explore,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Workspace",
        url: pageUrlMapping.participation_workspace,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Evaluation",
    url: pageUrlMapping.evaluation,
    icon: "evaluation",
    isActive: false,
    items: [
      {
        title: "Pending Solutions",
        url: pageUrlMapping.evaluation_pendingsolutions,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Evaluated By Me",
        url: pageUrlMapping.evaluation_evaluatedbyme,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Contribution",
    url: pageUrlMapping.contribution,
    icon: "contribution",
    isActive: false,
    items: [
      {
        title: "Contribute",
        url: pageUrlMapping.contribution_contribute,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "My Contributions",
        url: pageUrlMapping.contribution_my_contributions,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Moderation",
    url: pageUrlMapping.moderation,
    icon: "ShieldUser",
    isActive: false,
    items: [
      {
        title: "Pending Challenges",
        url: pageUrlMapping.moderation_pendingchallenges,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "My Reviews",
        url: pageUrlMapping.moderation_reviewchallenges,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },

  {
    title: "Career",
    url: pageUrlMapping.career,
    icon: "BriefcaseBusiness",
    isActive: false,
    items: [
      {
        title: "Available Jobs",
        url: pageUrlMapping.career_available_jobs,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "My Applications",
        url: pageUrlMapping.career_my_applications,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Account",
    url: pageUrlMapping.account,
    icon: "billing",
    isActive: false,

    items: [
      {
        title: "Profile",
        url: pageUrlMapping.account_profile,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        url: pageUrlMapping.account_settings,
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
];



export const quality_factors_questions = [
  {
    name: "relevance",
    label: "Relevance to the registered domain",
    description: "Does the challenge relate to the marked domain?",
  },
  {
    name: "technical_correctness",
    label: "Correctness of technical content",
    description: "Is the content technically accurate?",
  },
  {
    name: "completeness",
    label: "Completeness of problem statement",
    description: "Does it state problem, inputs, and outputs clearly?",
  },
  {
    name: "clarity",
    label: "Clarity and language quality",
    description: "Is the statement clear and unambiguous?",
  },
  {
    name: "originality",
    label: "Originality and creativity",
    description: "Does it introduce a new twist?",
  },
  {
    name: "unbiased",
    label: "Absence of bias or sensitive content",
    description: "Is it free from inappropriate biases?",
  },
  {
    name: "plagiarism_free",
    label: "No plagiarism",
    description: "Is the content original or properly cited?",
  },
];

export const account_button_items: AccountButtonItem[] = [
  {
    title: "Overview",
    href: pageUrlMapping.dashboard_overview,
    icon: "dashboard",
  },
  {
    title: "Profile",
    href: pageUrlMapping.account_profile,
    icon: "SquareUser",
  },
  {
    title: "Account Settings",
    href: pageUrlMapping.account_settings,
    icon: "settings",
  },
  {
    title: "Review Challenges",
    href: pageUrlMapping.moderation_reviewchallenges,
    icon: "ShieldUser",
  },
  {
    title: "My contributions",
    href: pageUrlMapping.contribution_my_contributions,
    icon: "contribution",
  },
  {
    title: "My participation",
    href: pageUrlMapping.participation_workspace,
    icon: "participation",
  },
];

// Menu items for the recruiter role in the account button dropdown
export const recruiter_account_button_items: AccountButtonItem[] = [
  {
    title: "Recruiter Dashboard",
    href: pageUrlMapping.recruiter_dashboard,
    icon: "dashboard",
  },
  {
    title: "Jobs",
    href: pageUrlMapping.recruiter_jobs,
    icon: "page",
  },
  {
    title: "Meetings",
    href: pageUrlMapping.recruiter_meetings,
    icon: "Cast",
  },
  {
    title: "Insights",
    href: pageUrlMapping.recruiter_insights,
    icon: "ChartNoAxesCombined",
  },
  {
    title: "Account",
    href: pageUrlMapping.recruiter_account,
    icon: "SquareUser",
  },
];

// Navigation items for the recruiter portal
export const recruiterNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: pageUrlMapping.recruiter_dashboard,
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Jobs",
    url: pageUrlMapping.recruiter_jobs,
    icon: "page",
    isActive: false,
    shortcut: ["j", "j"],
    items: [],
  },
  {
    title: "Meetings",
    url: pageUrlMapping.recruiter_meetings,
    icon: "Cast",
    isActive: false,
    shortcut: ["m", "m"],
    items: [],
  },
  {
    title: "Insights",
    url: pageUrlMapping.recruiter_insights,
    icon: "ChartNoAxesCombined",
    isActive: false,
    shortcut: ["i", "i"],
    items: [],
  },
  {
    title: "Account",
    url: pageUrlMapping.recruiter_account,
    icon: "SquareUser",
    isActive: false,
    shortcut: ["a", "a"],
    items: [],
  },
];
