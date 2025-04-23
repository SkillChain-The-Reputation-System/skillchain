import { NavItem } from 'types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Product',
    url: '/dashboard/product',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Account',
    url: '/dashboard/account',
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/account/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Settings',
        url: '/dashboard/account/settings',
        icon: 'userPen',
        shortcut: ['m', 'm']
      }
    ]
  },
  {
    title: 'Moderation',
    url: '/dashboard/moderate',
    icon: 'ShieldUser',
    isActive: true,
    items: [
      {
        title: 'Summary',
        url: '/dashboard/moderation/summary',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Pending Challenges',
        url: '/dashboard/moderation/pending-challenges',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Review Challenges',
        url: '/dashboard/moderation/review-challenges',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Settings',
        url: '/dashboard/moderation/settings',
        icon: 'userPen',
        shortcut: ['m', 'm']
      }
    ]
  },

  {
    title: 'Contribution',
    url: '/dashboard/contribution',
    icon: 'contribution',
    isActive: false,
    items: [
      {
        title: 'Contribute',
        url: '/dashboard/contribution/contribute',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'My Contributions',
        url: '/dashboard/contribution/my-contributions',
        icon: 'userPen',
        shortcut: ['m', 'm']
      }
    ]
  },
  {
    title: 'Participation',
    url: '/dashboard/participation',
    icon: 'participation',
    isActive: false,
    items: [
      {
        title: 'Explore',
        url: '/dashboard/participation/explore',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'My Participation',
        url: '/dashboard/participation/my-participation',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
    ]
  }
];

export const sidebarNavItemsProfileSettings = [
  {
    title: "Profile",
    href: "#"
  },
  {
    title: "Account",
    href: "##"
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


export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
