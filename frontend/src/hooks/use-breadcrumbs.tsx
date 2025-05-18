"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { pageUrlMapping } from "../constants/navigation";

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  [pageUrlMapping.dashboard]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
  ],
  [pageUrlMapping.account]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Account", link: pageUrlMapping.account },
  ],
  [pageUrlMapping.account_profile]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Account", link: pageUrlMapping.account },
    { title: "Profile", link: pageUrlMapping.account_profile },
  ],
  [pageUrlMapping.account_settings]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Account", link: pageUrlMapping.account },
    { title: "Settings", link: pageUrlMapping.account_settings },
  ],
  [pageUrlMapping.contribution_contribute]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Contribution", link: pageUrlMapping.contribution },
    { title: "Contribute", link: pageUrlMapping.contribution_contribute },
  ],
  [pageUrlMapping.contribution_my_contributions]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Contribution", link: pageUrlMapping.contribution },
    {
      title: "My Contributions",
      link: pageUrlMapping.contribution_my_contributions,
    },
  ],
  [pageUrlMapping.participation_explore]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Participation", link: pageUrlMapping.participation },
    { title: "Explore", link: pageUrlMapping.participation_explore },
  ],
  [pageUrlMapping.participation_workspace]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Participation", link: pageUrlMapping.participation },
    { title: "Workspace", link: pageUrlMapping.participation_workspace },
  ],
  "/dashboard/evaluation/pending-solutions": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Evaluation", link: "/dashboard/evaluation" },
    { title: "Pending Solutions", link: "/dashboard/evaluation/pending-solutions" },
  ],
  "/dashboard/evaluation/evaluated-by-me": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Evaluation", link: "/dashboard/evaluation" },
    { title: "Evaluated By Me", link: "/dashboard/evaluation/evaluated-by-me" },
  ],
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path,
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
