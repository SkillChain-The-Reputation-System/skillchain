"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, ArrowLeftIcon, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "react-toastify";
import {
  fetchJobApplicationByID,
  fetchPossibleApplicationStatusTransitions,
} from "@/lib/fetching-onchain-data-utils";
import { updateJobApplicationStatus } from "@/lib/write-onchain-utils";
import { JobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { ApplicationStatusLabels } from "@/constants/system";
import { Button, buttonVariants } from "@/components/ui/button";
import { pageUrlMapping } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Dynamic imports for better code splitting
const ApplicantProfileCard = dynamic(() => import("./applicant-profile-card"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96" />,
});

const JobApplicationDetailsCard = dynamic(
  () => import("./job-application-details-card"),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
    ),
  }
);

const InterviewInformationCard = dynamic(
  () => import("./interview-information-card"),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-48" />
    ),
  }
);

const QualificationsFitCard = dynamic(
  () => import("./qualifications-fit-card"),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64" />
    ),
  }
);

export default function ApplicationDetailContainer() {
  const params = useParams();
  const jobId = params.id as string;
  const applicationId = params["applicant-id"] as string;
  const [application, setApplication] =
    useState<JobApplicationInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] =
    useState<JobApplicationStatus | null>(null);

  const [possibleStatuses, setPossibleStatuses] = useState<
    JobApplicationStatus[]
  >([]);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch application data and possible status transitions
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        if (!applicationId) {
          throw new Error("Application ID is not provided");
        }

        const applicationData = await fetchJobApplicationByID(applicationId);
        if (!applicationData) {
          throw new Error("Failed to fetch application data");
        }

        setApplication(applicationData);
        setApplicationStatus(applicationData.status);

        // Get possible status transitions for this application
        try {
          if (applicationData.status === JobApplicationStatus.WITHDRAWN) {
            setPossibleStatuses([]);
          } else {
            const transitions = await fetchPossibleApplicationStatusTransitions(
              applicationData.status
            );
            setPossibleStatuses(transitions);
          }
        } catch (transitionError) {
          console.error("Error fetching status transitions:", transitionError);
          setPossibleStatuses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);
  
  // Function to refresh application data after status update
  const refreshApplicationData = async () => {
    try {
      setStatusLoading(true);
      const applicationData = await fetchJobApplicationByID(applicationId);
      if (applicationData) {
        setApplication(applicationData);
        setApplicationStatus(applicationData.status);

        // Update possible status transitions for the new status
        if (applicationData.status === JobApplicationStatus.WITHDRAWN) {
          setPossibleStatuses([]);
        } else {
          const transitions = await fetchPossibleApplicationStatusTransitions(
            applicationData.status
          );
          setPossibleStatuses(transitions);
        }
      }
    } catch (error) {
      console.error("Error refreshing application data:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const removePointerEventsFromBody = () => {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading application data...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">
          {error || "Failed to load application"}
        </p>
      </div>
    );
  }
  return (
    <div className="px-4 pb-10 mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <PageHeader
          title="Application Details"
          description={`Review the application for ${application.job.title}`}
          actions={
            <Link
              href={`${pageUrlMapping.recruiter_jobs}/${jobId}/applicants`}
              className="flex gap-2 items-center text-primary hover:underline hover:underline-offset-4"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to Applicants
            </Link>
          }
        />
        <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Applicant Profile Card */}
        <div className="md:col-span-1">
          <ApplicantProfileCard application={application} />
        </div>

        {/* Application Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Job and Application Info Card */}
          <JobApplicationDetailsCard
            application={application}
            possibleStatuses={possibleStatuses}
            statusLoading={statusLoading}
            onApplicationUpdate={refreshApplicationData}
            removePointerEventsFromBody={removePointerEventsFromBody}
          />
          {/* Interview Information Card */}
          <InterviewInformationCard
            applicationStatus={applicationStatus!}
            applicationId={applicationId}
          />
          {/* Job Requirements and Fit */}
          <QualificationsFitCard application={application} />
        </div>
      </div>
    </div>
  );
}
