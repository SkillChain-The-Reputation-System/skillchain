"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchAllApplicationCountsByJobID,
  fetchJobById,
  fetchApplicantsByJobID,
} from "@/lib/fetching-onchain-data-utils";
import { JobDurationLabels, JobApplicationStatus } from "@/constants/system";
import { JobInterface } from "@/lib/interfaces";
import { ArrowLeft, FileEdit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicantsTable } from "@/features/jobs-on-recruiter/applicant/applicants-table/data-table";
import { ApplicantColumns } from "@/features/jobs-on-recruiter/applicant/applicants-table/column";

import { JobApplicantionInterface } from "@/lib/interfaces";

// Lazy load the metrics component for better performance
const JobApplicantsMetrics = lazy(() =>
  import("@/features/jobs-on-recruiter/applicant/applicants-metrics").then((mod) => ({
    default: mod.JobApplicantsMetrics,
  }))
);

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<{
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    interviewing: number;
    rejected: number;
    withdrawn: number;
    hired: number;
  }>({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewing: 0,
    rejected: 0,
    withdrawn: 0,
    hired: 0,
  });

  // State to store real applicant data
  const [applicants, setApplicants] = useState<JobApplicantionInterface[]>([]);
  // Fetch job data and application counts for each status
  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const fetchedJob = await fetchJobById(jobId);
        setJob(fetchedJob);
        const total = fetchedJob?.application_count || 0;

        // Fetch application counts for all statuses in a single operation
        const statusCounts = await fetchAllApplicationCountsByJobID(jobId);

        setCounts({
          total,
          pending: statusCounts.pending,
          reviewing: statusCounts.reviewing,
          shortlisted: statusCounts.shortlisted,
          interviewing: statusCounts.interviewing,
          rejected: statusCounts.rejected,
          withdrawn: statusCounts.withdrawn,
          hired: statusCounts.hired,
        });

        // Fetch real applicant data
        const applicantData = await fetchApplicantsByJobID(jobId);
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
    <div className="container px-4 py-6">
      {/* Back to Jobs Link */}
      <Link
        href="/recruiter/jobs"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to Jobs</span>
      </Link>

      {/* Job Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {loading ? "Loading..." : job?.title || "Job Details"}
          </h1>
          {job && (
            <div className="flex flex-wrap items-center gap-2 text-slate-600 max-w-full">
              <span
                className="truncate max-w-[200px]"
                title={job.location || "Remote"}
              >
                {job.location || "Remote"}
              </span>
              <span>•</span>
              <span
                className="truncate max-w-[200px]"
                title={
                  job.duration !== undefined
                    ? JobDurationLabels[job.duration]
                    : "Unspecified"
                }
              >
                {job.duration !== undefined
                  ? JobDurationLabels[job.duration]
                  : "Unspecified"}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileEdit size={16} />
            Edit Job
          </Button>
          <Button className="flex items-center gap-2">
            <Eye size={16} />
            View Job Post
          </Button>
        </div>
      </div>
      {/* Key Metrics Cards - Lazy loaded component */}
      <Suspense
        fallback={
          <div className="h-40 animate-pulse bg-slate-100 rounded-md mb-6"></div>
        }
      >
        <JobApplicantsMetrics counts={counts} />
      </Suspense>

      {/* Applicants Table */}
      <ApplicantsTable
        columns={ApplicantColumns}
        data={applicants}
        searchPlaceholder="Search applicants by address or ID..."
        isLoading={loading}
      />
    </div>
  );
}
