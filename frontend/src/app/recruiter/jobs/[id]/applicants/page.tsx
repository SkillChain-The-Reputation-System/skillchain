"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  fetchAllApplicationCountsByJobID,
  fetchJobById,
  fetchBriefApplicationByJobID,
} from "@/lib/fetching-onchain-data-utils";
import { JobApplicationStatus } from "@/constants/system";
import { JobApplicationMetricsInterface, JobInterface } from "@/lib/interfaces";
import { ArrowLeft, FileEdit } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

import { BriefJobApplicationInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { pageUrlMapping } from "@/constants/navigation";

// Dynamic imports for better code splitting and performance
const JobApplicantsMetrics = dynamic(
  () =>
    import("@/features/jobs-on-recruiter/applicant/applicants-metrics").then(
      (mod) => ({
        default: mod.JobApplicantsMetrics,
      })
    ),
  {
    loading: () => (
      <div className="h-40 animate-pulse bg-slate-100 rounded-md mb-6"></div>
    ),
  }
);

const JobInfo = dynamic(
  () => import("@/features/jobs-on-recruiter/applicant/job-info"),
  {
    loading: () => (
      <div className="h-24 animate-pulse bg-slate-100 rounded-md"></div>
    ),
  }
);

const ApplicantsTable = dynamic(
  () =>
    import(
      "@/features/jobs-on-recruiter/applicant/applicants-table/data-table"
    ).then((mod) => ({ default: mod.ApplicantsTable })),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-slate-100 rounded-md"></div>
    ),
  }
) as React.ComponentType<{
  columns: ColumnDef<BriefJobApplicationInterface, unknown>[];
  data: BriefJobApplicationInterface[];
  searchPlaceholder?: string;
  isLoading?: boolean;
}>;

// Import ApplicantColumns statically as it's needed for the table structure
import { ApplicantColumns } from "@/features/jobs-on-recruiter/applicant/applicants-table/column";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<JobApplicationMetricsInterface>({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    rejected: 0,
    withdrawn: 0,
    hired: 0,
  });

  // State to store real applicant data
  const [applicants, setApplicants] = useState<BriefJobApplicationInterface[]>(
    []
  );
  // Fetch job data and application counts for each status
  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const fetchedJob = await fetchJobById(jobId);
        setJob(fetchedJob);
        const total = fetchedJob?.applicants || 0;

        // Fetch application counts for all statuses in a single operation
        const statusCounts = await fetchAllApplicationCountsByJobID(jobId);

        setCounts({
          total,
          pending: statusCounts.pending,
          reviewing: statusCounts.reviewing,
          shortlisted: statusCounts.shortlisted,
          interviewed: statusCounts.interviewed,
          rejected: statusCounts.rejected,
          withdrawn: statusCounts.withdrawn,
          hired: statusCounts.hired,
        });

        // Fetch real applicant data
        const applicantData = await fetchBriefApplicationByJobID(jobId);
        setApplicants(applicantData);
      } catch (error) {
        console.error("Error fetching job data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  return (
    <div className="px-4 py-6">
      {/* Back to Job Post Link */}
      <Link
        href={`${pageUrlMapping.recruiter_jobs}/${jobId}`}
        className={cn(buttonVariants(), "mb-4 flex-1 items-center gap-2")}
      >
        <ArrowLeft size={16} />
        <span>Back to Job Post</span>
      </Link>
      {/* Job Header Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">
            {loading ? "Loading..." : job?.title || "Job Details"}
          </h1>
          <Link
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex items-center gap-2"
            )}
            href={`${pageUrlMapping.recruiter_jobs}/${jobId}/edit`}
          >
            <FileEdit size={16} />
            Edit Job
          </Link>
        </div>
        {job && (
          <Suspense
            fallback={
              <div className="h-24 animate-pulse bg-slate-100 rounded-md"></div>
            }
          >
            <JobInfo job={job} />
          </Suspense>
        )}
      </div>
      {/* Key Metrics Cards - Dynamic loaded component */}
      <Suspense
        fallback={
          <div className="h-40 animate-pulse bg-slate-100 rounded-md mb-6"></div>
        }
      >
        <JobApplicantsMetrics counts={counts} />
      </Suspense>
      {/* Applicants Table - Dynamic loaded component */}
      <Suspense
        fallback={
          <div className="h-96 animate-pulse bg-slate-100 rounded-md"></div>
        }
      >
        <ApplicantsTable
          columns={ApplicantColumns}
          data={applicants}
          searchPlaceholder="Search applicants by address or ID..."
          isLoading={loading}
        />
      </Suspense>
    </div>
  );
}
