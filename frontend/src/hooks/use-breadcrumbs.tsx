"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ title: "Dashboard", link: "/dashboard" }],
  "/dashboard/employee": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Employee", link: "/dashboard/employee" },
  ],
  "/dashboard/product": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Product", link: "/dashboard/product" },
  ],
  "/dashboard/account": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Account", link: "/dashboard/account" },
  ],
  "/dashboard/account/profile": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Account", link: "/dashboard/account" },
    { title: "Profile", link: "/dashboard/account/profile" },
  ],
  "/dashboard/account/settings": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Account", link: "/dashboard/account" },
    { title: "Settings", link: "/dashboard/account/settings" },
  ],
  "/dashboard/contribution/contribute": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Contribution", link: "/dashboard/contribution" },
    { title: "Contribute", link: "/dashboard/contribution/contribute" },
  ],
  "/dashboard/contribution/my-contributions": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Contribution", link: "/dashboard/contribution" },
    { title: "My Contributions", link: "/dashboard/contribution/my-contributions" },
  ],
  "/dashboard/participation/explore": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Participation", link: "/dashboard/participation" },
    { title: "Explore", link: "/dashboard/participation/explore" },
  ],
  "/dashboard/participation/workspace": [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Participation", link: "/dashboard/participation" },
    { title: "Workspace", link: "/dashboard/participation/workspace" },
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
