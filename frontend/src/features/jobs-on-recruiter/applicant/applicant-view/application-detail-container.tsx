"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "react-toastify";
import {
  fetchJobApplicationByID,
  fetchPossibleApplicationStatusTransitions,
} from "@/lib/fetching-onchain-data-utils";
import { updateJobApplicationStatus } from "@/lib/write-onchain-utils";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { ApplicationStatusLabels } from "@/constants/system";
import { MockInterviewData } from "./types";

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

const StatusChangeDialog = dynamic(() => import("./status-change-dialog"), {
  ssr: false,
});

// Mock interview data
const mockInterviewData: MockInterviewData = {
  scheduledDate: new Date(2025, 5, 30, 14, 0), // June 30, 2025, 2:00 PM
  duration: 60, // minutes
  meetingLink: "https://meet.google.com/abc-defg-hij",
  additionalNotes:
    "Please prepare a brief presentation about your previous projects",
};

export default function ApplicationDetailContainer() {
  const params = useParams();
  const jobId = params.id as string;
  const applicationId = params["applicant-id"] as string;

  const [application, setApplication] =
    useState<JobApplicationWithJobDataInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] =
    useState<JobApplicationStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobApplicationStatus | null>(null);
  const [possibleStatuses, setPossibleStatuses] = useState<
    JobApplicationStatus[]
  >([]);
  const [statusLoading, setStatusLoading] = useState(false);

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

  const handleStatusChange = (value: string) => {
    const status = parseInt(value) as JobApplicationStatus;
    if (application && status !== application.status) {
      setNewStatus(status);
      setIsDialogOpen(true);
    }
  };

  const removePointerEventsFromBody = () => {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  };

  const confirmStatusChange = async () => {
    if (!application || !newStatus) return;

    try {
      setStatusLoading(true);
      await updateJobApplicationStatus(applicationId, newStatus);

      // Clear dialog state first
      setIsDialogOpen(false);

      // Update application status locally
      setApplication((prevApplication) => {
        if (!prevApplication) return null;
        return {
          ...prevApplication,
          status: newStatus,
        };
      });
      setApplicationStatus(newStatus); // Show success message
      toast.success(
        `Application status updated to ${
          ApplicationStatusLabels[
            newStatus as keyof typeof ApplicationStatusLabels
          ]
        }`
      );

      // Update possible transitions for the new status
      try {
        if (newStatus === JobApplicationStatus.WITHDRAWN) {
          setPossibleStatuses([]);
        } else {
          const transitions = await fetchPossibleApplicationStatusTransitions(
            newStatus
          );
          setPossibleStatuses(transitions);
        }
      } catch (transitionError) {
        console.error("Error fetching status transitions:", transitionError);
        setPossibleStatuses([]);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        "Failed to update application status. Please try again later."
      );
    } finally {
      setStatusLoading(false);
      setNewStatus(null);
    }
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setNewStatus(null);
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
    <div className="px-4 pb-10 max-w-7xl mx-auto overflow-x-hidden">
      {/* Status Change Dialog */}
      <StatusChangeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        application={application}
        newStatus={newStatus}
        onConfirm={confirmStatusChange}
        statusLoading={statusLoading}
        onCancel={handleDialogCancel}
      />

      {/* Header */}
      <div className="mb-8">
        <PageHeader
          title="Application Details"
          description={`Review the application for ${application.job.title}`}
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
            onStatusChange={handleStatusChange}
            removePointerEventsFromBody={removePointerEventsFromBody}
          />

          {/* Interview Information Card */}
          <InterviewInformationCard
            applicationStatus={applicationStatus!}
            mockInterviewData={mockInterviewData}
          />

          {/* Job Requirements and Fit */}
          <QualificationsFitCard application={application} />
        </div>
      </div>
    </div>
  );
}
