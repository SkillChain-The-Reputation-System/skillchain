import { NavItem } from "types";
import { pageUrlMapping } from "./navigation";

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: pageUrlMapping.dashboard,
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Account",
    url: pageUrlMapping.account,
    icon: "billing",
    isActive: true,

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
  {
    title: "Moderation",
    url: pageUrlMapping.moderation,
    icon: "ShieldUser",
    isActive: true,
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
      }
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
];

export const sidebarNavItemsProfileSettings = [
  {
    title: "Profile",
    href: "#",
  },
  {
    title: "Account",
    href: "##",
  },
  // {
  //   title: "Appearance",
  //   href: "##"
  // },
  // {
  //   title: "Notifications",
  //   href: "###"
  // },
  // {
  //   title: "Display",
  //   href: "####"
  // }
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
