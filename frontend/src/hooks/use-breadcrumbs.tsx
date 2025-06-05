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
  [pageUrlMapping.evaluation_pendingsolutions]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Evaluation", link: pageUrlMapping.evaluation },
    {
      title: "Pending Solutions",
      link: pageUrlMapping.evaluation_pendingsolutions,
    },
  ],
  [pageUrlMapping.evaluation_evaluatedbyme]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Evaluation", link: pageUrlMapping.evaluation },
    { title: "Evaluated By Me", link: pageUrlMapping.evaluation_evaluatedbyme },
  ],
  [pageUrlMapping.career_available_jobs]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Career", link: pageUrlMapping.career },
    { title: "Available Jobs", link: pageUrlMapping.career_available_jobs },
  ],
  [pageUrlMapping.career_my_applications]: [
    { title: "Dashboard", link: pageUrlMapping.dashboard },
    { title: "Career", link: pageUrlMapping.career },
    { title: "My Applications", link: pageUrlMapping.career_my_applications },
  ],
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // Special case for job applicants page and job pages with long IDs
    // Using looser regex that will match any segment that looks like a job ID
    const jobApplicantsRegex = /^\/recruiter\/jobs\/([^\/]+)\/applicants$/i;
    const jobEditRegex = /^\/recruiter\/jobs\/([^\/]+)\/edit$/i;
    const jobPageRegex = /^\/recruiter\/jobs\/([^\/]+)$/i;

    if (jobApplicantsRegex.test(pathname)) {
      const jobId = pathname.match(jobApplicantsRegex)![1];
      // Always shorten the ID if it's longer than 10 characters
      const displayId =
        jobId.length > 10 ? `${jobId.substring(0, 8)}...` : jobId;
      return [
        { title: "Recruiter", link: "/recruiter" },
        { title: "Jobs", link: "/recruiter/jobs" },
        { title: `${displayId}`, link: `/recruiter/jobs/${jobId}` },
        { title: "Applicants", link: pathname },
      ];
    }

    if (jobEditRegex.test(pathname)) {
      const jobId = pathname.match(jobEditRegex)![1];
      // Always shorten the ID if it's longer than 10 characters
      const displayId =
        jobId.length > 10 ? `${jobId.substring(0, 8)}...` : jobId;
      return [
        { title: "Recruiter", link: "/recruiter" },
        { title: "Jobs", link: "/recruiter/jobs" },
        { title: `${displayId}`, link: `/recruiter/jobs/${jobId}` },
        { title: "Edit", link: pathname },
      ];
    }

    if (jobPageRegex.test(pathname)) {
      const jobId = pathname.match(jobPageRegex)![1];
      // Always shorten the ID if it's longer than 10 characters
      const displayId =
        jobId.length > 10 ? `${jobId.substring(0, 8)}...` : jobId;
      return [
        { title: "Recruiter", link: "/recruiter" },
        { title: "Jobs", link: "/recruiter/jobs" },
        { title: `${displayId}`, link: pathname },
      ];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;

      // Format the segment title
      let title = segment;

      // Check if segment might be a long ID (any segment longer than 10 characters)
      // This catches hex IDs as well as UUIDs and other long identifiers
      if (segment.length > 20) {
        // Shorten IDs to first 8 characters + ellipsis
        title = `${segment.substring(0, 8)}...`;
      }

      // Format the title with proper capitalization
      title = title.charAt(0).toUpperCase() + title.slice(1).replace(/-/g, " ");

      return {
        title: title,
        link: path,
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
