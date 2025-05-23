"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchApplicationCountByJobIDAndStatus,
  fetchJobById,
} from "@/lib/fetching-onchain-data-utils";
import {
  JobDuration,
  JobDurationLabels,
  JobApplicationStatus,
} from "@/constants/system";
import { JobInterface } from "@/lib/interfaces";
import { ArrowLeft, FileEdit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicantsTable } from "@/features/jobs-on-recruiter/applicants-table/data-table";
import {
  ApplicantColumns,
} from "@/features/jobs-on-recruiter/applicants-table/column";

import { ApplicantInterface } from "@/lib/interfaces";

// Lazy load the metrics component for better performance
const JobApplicantsMetrics = lazy(() =>
  import("@/features/jobs-on-recruiter/applicants-metrics").then((mod) => ({
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
  // Mock applicants data for now
  const [applicants, setApplicants] = useState<ApplicantInterface[]>([
    {
      id: "0x1234567890abcdef",
      address: "0xaBcD...1234",
      fullAddress: "0xaBcD1234567890abcdef1234567890abcdef1234",
      status: JobApplicationStatus.PENDING,
      applied_at: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      id: "0x2345678901abcdef",
      address: "0xbCdE...2345",
      fullAddress: "0xbCdE2345678901abcdef2345678901abcdef2345",
      status: JobApplicationStatus.REVIEWING,
      applied_at: Date.now() - 86400000 * 3, // 3 days ago
    },
    {
      id: "0x3456789012abcdef",
      address: "0xcDeF...3456",
      fullAddress: "0xcDeF3456789012abcdef3456789012abcdef3456",
      status: JobApplicationStatus.SHORTLISTED,
      applied_at: Date.now() - 86400000 * 4, // 4 days ago
    },
    {
      id: "0x456789012abcdef3",
      address: "0xdEfA...4567",
      fullAddress: "0xdEfA456789012abcdef456789012abcdef4567",
      status: JobApplicationStatus.INTERVIEWING,
      applied_at: Date.now() - 86400000 * 5, // 5 days ago
    },
    {
      id: "0x56789012abcdef34",
      address: "0xeFaB...5678",
      fullAddress: "0xeFaB56789012abcdef56789012abcdef5678",
      status: JobApplicationStatus.REJECTED,
      applied_at: Date.now() - 86400000 * 6, // 6 days ago
    },
  ]);

  // Fetch job data and application counts for each status
  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const fetchedJob = await fetchJobById(jobId);
        setJob(fetchedJob);

        // Fetch application counts for each status
        const totalPending = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.PENDING
        );
        const totalReviewing = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.REVIEWING
        );
        const totalShortlisted = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.SHORTLISTED
        );
        const totalInterviewing = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.INTERVIEWING
        );
        const totalRejected = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.REJECTED
        );
        const totalWithdrawn = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.WITHDRAWN
        );
        const totalHired = await fetchApplicationCountByJobIDAndStatus(
          jobId,
          JobApplicationStatus.HIRED
        );

        const total =
          totalPending +
          totalReviewing +
          totalShortlisted +
          totalInterviewing +
          totalRejected +
          totalWithdrawn +
          totalHired;

        setCounts({
          total,
          pending: totalPending,
          reviewing: totalReviewing,
          shortlisted: totalShortlisted,
          interviewing: totalInterviewing,
          rejected: totalRejected,
          withdrawn: totalWithdrawn,
          hired: totalHired,
        });
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
