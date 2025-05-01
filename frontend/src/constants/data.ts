import { NavItem } from "types";

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Product",
    url: "/dashboard/product",
    icon: "product",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Account",
    url: "/dashboard/account",
    icon: "billing",
    isActive: true,

    items: [
      {
        title: "Profile",
        url: "/dashboard/account/profile",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        url: "/dashboard/account/settings",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Moderation",
    url: "/dashboard/moderate",
    icon: "ShieldUser",
    isActive: true,
    items: [
      {
        title: "Summary",
        url: "/dashboard/moderation/summary",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Pending Challenges",
        url: "/dashboard/moderation/pending-challenges",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Review Challenges",
        url: "/dashboard/moderation/review-challenges",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "Settings",
        url: "/dashboard/moderation/settings",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },

  {
    title: "Contribution",
    url: "/dashboard/contribution",
    icon: "contribution",
    isActive: false,
    items: [
      {
        title: "Contribute",
        url: "/dashboard/contribution/contribute",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "My Contributions",
        url: "/dashboard/contribution/my-contributions",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
    ],
  },
  {
    title: "Participation",
    url: "/dashboard/participation",
    icon: "participation",
    isActive: false,
    items: [
      {
        title: "Explore",
        url: "/dashboard/participation/explore",
        icon: "userPen",
        shortcut: ["m", "m"],
      },
      {
        title: "My Participation",
        url: "/dashboard/participation/my-participation",
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
    name: "correctness",
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
    name: "absenceBias",
    label: "Absence of bias or sensitive content",
    description: "Is it free from inappropriate biases?",
  },
  {
    name: "noPlagiarism",
    label: "No plagiarism",
    description: "Is the content original or properly cited?",
  },
];
