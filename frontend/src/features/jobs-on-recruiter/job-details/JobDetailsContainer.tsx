"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  fetchJobById,
  getPossibleJobStatusTransitions,
} from "@/lib/fetching-onchain-data-utils";
import { updateJobStatus } from "@/lib/write-onchain-utils";
import { JobInterface } from "@/lib/interfaces";
import { JobStatus, JobStatusLabels } from "@/constants/system";
import { toast } from "react-toastify";

// Dynamic imports with loading states
const JobDetailsHeader = dynamic(() => import("./JobDetailsHeader"), {
  loading: () => <div className="h-20 bg-slate-200 animate-pulse rounded-md" />,
});

const JobStatusDialog = dynamic(() => import("./JobStatusDialog"), {
  loading: () => null,
});

const JobDetailsCard = dynamic(() => import("./JobDetailsCard"), {
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-lg" />,
});

const JobDomainsCard = dynamic(() => import("./JobDomainsCard"), {
  loading: () => <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />,
});

const JobOverviewCard = dynamic(() => import("./JobOverviewCard"), {
  loading: () => <div className="h-48 bg-slate-200 animate-pulse rounded-lg" />,
});

const JobReputationCard = dynamic(() => import("./JobReputationCard"), {
  loading: () => <div className="h-32 bg-slate-200 animate-pulse rounded-lg" />,
});

const JobDetailsLoading = dynamic(() => import("./JobDetailsLoading"), {
  loading: () => <div>Loading...</div>,
});

const JobNotFound = dynamic(() => import("./JobNotFound"), {
  loading: () => <div>Loading...</div>,
});

export default function JobDetailsContainer() {
  const params = useParams();
  const [job, setJob] = useState<JobInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus | null>(null);
  const [possibleStatuses, setPossibleStatuses] = useState<JobStatus[]>([]);
  const jobId = params.id as string;

  // Fetch job data and possible status transitions
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const jobData = await fetchJobById(jobId);
        setJob(jobData);

        // Get possible status transitions
        if (jobData) {
          try {
            const transitions = await getPossibleJobStatusTransitions(
              jobData.status
            );
            setPossibleStatuses(transitions);
          } catch (transitionError) {
            console.error(
              "Error fetching status transitions:",
              transitionError
            );
            // Clear transitions as fallback
            setPossibleStatuses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);
  // Handle status change
  const handleStatusChange = (status: JobStatus) => {
    if (job && status !== job.status) {
      setNewStatus(status);
      setIsDialogOpen(true);
    }
  };

  // Remove pointer events helper
  const removePointerEventsFromBody = () => {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!job || !newStatus) return;

    try {
      setStatusLoading(true);
      await updateJobStatus(jobId, newStatus);

      // Clear dialog state first
      setIsDialogOpen(false);

      // Update job status locally
      setJob((prevJob) => {
        if (!prevJob) return null;
        return {
          ...prevJob,
          status: newStatus,
        };
      });

      // Show success message
      toast.success(`Job status updated to ${JobStatusLabels[newStatus]}`);

      // Update possible transitions for the new status in a separate operation
      try {
        const transitions = await getPossibleJobStatusTransitions(newStatus);
        setPossibleStatuses(transitions);
      } catch (transitionError) {
        console.error("Error fetching status transitions:", transitionError);
        // Set empty transitions as fallback
        setPossibleStatuses([]);
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status. Please try again later.");
    } finally {
      setStatusLoading(false);
      setNewStatus(null);
    }
  };

  // Handle dialog cancel
  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setNewStatus(null);
  };
  if (loading) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <JobDetailsLoading />
      </Suspense>
    );
  }

  if (!job) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <JobNotFound />
      </Suspense>
    );
  }

  return (
    <div className="px-4 space-y-2">
      <Suspense fallback={<div className="h-20 bg-slate-200 animate-pulse rounded-md" />}>
        <JobDetailsHeader job={job} jobId={jobId} />
      </Suspense>

      <Suspense fallback={null}>
        <JobStatusDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          job={job}
          newStatus={newStatus}
          statusLoading={statusLoading}
          onConfirm={confirmStatusChange}
          onCancel={handleDialogCancel}
        />
      </Suspense>

      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="h-64 bg-slate-200 animate-pulse rounded-lg" />}>
              <JobDetailsCard
                job={job}
                possibleStatuses={possibleStatuses}
                statusLoading={statusLoading}
                onStatusChange={handleStatusChange}
                removePointerEventsFromBody={removePointerEventsFromBody}
              />
            </Suspense>

            <Suspense fallback={<div className="h-32 bg-slate-200 animate-pulse rounded-lg" />}>
              <JobDomainsCard job={job} />
            </Suspense>
          </div>

          <div className="space-y-6">
            <Suspense fallback={<div className="h-48 bg-slate-200 animate-pulse rounded-lg" />}>
              <JobOverviewCard job={job} jobId={jobId} />
            </Suspense>

            <Suspense fallback={<div className="h-32 bg-slate-200 animate-pulse rounded-lg" />}>
              <JobReputationCard job={job} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
