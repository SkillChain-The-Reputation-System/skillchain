"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { fetchJobApplicationByID } from "@/lib/fetching-onchain-data-utils";
import { withdrawJobApplication } from "@/lib/write-onchain-utils";
import { JobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { toast } from "react-toastify";
import { differenceInDays } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Dynamic load the application detail components
const ApplicationJobDetailsCard = dynamic(
  () => import("./application-job-details-card"),
  {
    loading: () => <CardSkeleton />,
  }
);
const ApplicationJobOverviewCard = dynamic(
  () => import("./application-job-overview-card"),
  {
    loading: () => <CardSkeleton />,
  }
);
const ApplicationStatusCard = dynamic(
  () => import("./application-status-card"),
  {
    loading: () => <CardSkeleton />,
  }
);

// Loading fallback components for each card type
function ApplicationStatusCardSkeleton() {
  return (
    <div className="border rounded-xl shadow-sm space-y-6">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-48 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-6 w-24 bg-slate-200 animate-pulse rounded-full"></div>
        </div>
      </div>
      
      {/* Application Overview */}
      <div className="px-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-10 bg-slate-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-28 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-10 bg-slate-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
        <div className="h-px bg-slate-200"></div>
      </div>

      {/* Reputation Requirements */}
      <div className="px-6 space-y-4">
        <div className="h-6 w-56 bg-slate-200 animate-pulse rounded"></div>
        <div className="flex gap-2 flex-wrap">
          <div className="h-6 w-20 bg-slate-200 animate-pulse rounded-full"></div>
          <div className="h-6 w-24 bg-slate-200 animate-pulse rounded-full"></div>
        </div>
        <div className="h-px bg-slate-200"></div>
      </div>

      {/* Status Alert */}
      <div className="px-6 pb-6">
        <div className="h-16 bg-slate-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
}

function ApplicationJobOverviewCardSkeleton() {
  return (
    <div className="border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded"></div>
      </div>
      
      {/* Content */}
      <div className="p-6 pt-4 space-y-4">
        {/* Job details list */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-4 items-center py-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-slate-200 animate-pulse rounded"></div>
            </div>
            <div className="flex justify-end">
              <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
        
        {/* Status section */}
        <div className="grid grid-cols-2 gap-4 items-center py-2 pt-4 border-t">
          <div className="h-4 w-16 bg-slate-200 animate-pulse rounded"></div>
          <div className="flex justify-end">
            <div className="h-6 w-20 bg-slate-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationJobDetailsCardSkeleton() {
  return (
    <div className="border rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="h-6 w-28 bg-slate-200 animate-pulse rounded"></div>
      </div>
      
      {/* Content */}
      <div className="p-6 pt-4 space-y-3">
        {/* Three dialog buttons */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

// Generic fallback for dynamic imports
function CardSkeleton() {
  return (
    <div className="border rounded-xl py-6 shadow-sm space-y-4">
      <div className="px-6 flex gap-2">
        <div className="h-6 w-6 rounded-md bg-slate-200 animate-pulse"></div>
        <div className="h-6 w-36 rounded-md bg-slate-200 animate-pulse"></div>
      </div>
      <div className="px-6">
        <div className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  );
}

export default function ApplicationDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [application, setApplication] =
    useState<JobApplicationInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const applicationId = params.id as string;

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        const applicationData = await fetchJobApplicationByID(applicationId);
        setApplication(applicationData);
      } catch (error) {
        console.error("Error fetching application details:", error);
        toast.error(
          "Failed to fetch application details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);
  // Handle application withdrawal
  const handleWithdrawApplication = async () => {
    if (!address) {
      toast.error("Please connect your wallet to withdraw the application");
      return;
    }

    try {
      toast.info("Withdrawing application...");
      
      // Call the blockchain function to withdraw the application
      const txHash = await withdrawJobApplication(address, applicationId);
      
      toast.success("Application withdrawn successfully!");
      console.log("Withdrawal transaction hash:", txHash);
      
      // Update application status locally for immediate UI feedback
      if (application) {
        setApplication({
          ...application,
          status: JobApplicationStatus.WITHDRAWN
        });
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error("Failed to withdraw application. Please try again later.");
    }
  };
  if (loading) {
    return (
      <div>
        <div className="flex flex-col space-y-8">
          {/* Page header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-md" />
            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded-md" />
          </div>
          
          {/* Separator */}
          <div className="h-px bg-slate-200"></div>
          
          {/* Main content layout matching the actual structure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Application Status - Main Component) */}
            <div className="lg:col-span-2">
              <ApplicationStatusCardSkeleton />
            </div>

            {/* Right Column (Overview & Job Details) */}
            <div className="space-y-6">
              <ApplicationJobOverviewCardSkeleton />
              <ApplicationJobDetailsCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
        <p className="text-slate-600 mb-6">
          The requested application could not be found.
        </p>
        <Button
          onClick={() => router.push("/dashboard/career/my-applications")}
        >
          Return to My Applications
        </Button>
      </div>
    );
  }

  // Calculate days left until deadline
  const deadlineDaysLeft = application.job.deadline
    ? differenceInDays(new Date(application.job.deadline), new Date())
    : null;

  // Format deadline display
  const deadlineDisplay =
    deadlineDaysLeft !== null
      ? deadlineDaysLeft > 0
        ? `${deadlineDaysLeft} days left`
        : "Deadline passed"
      : "No deadline";

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title={`Application for ${application.job.title}`}
        description="View and manage your job application"
        actions={
          application.status !== JobApplicationStatus.WITHDRAWN &&
          application.status !== JobApplicationStatus.HIRED &&
          application.status !== JobApplicationStatus.REJECTED && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="withdraw">Withdraw Application</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to withdraw your application for the
                    job "{application.job.title}" ? This action cannot be undone
                    and you will not be able to reapply for this position.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleWithdrawApplication}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Withdraw Application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <div className="flex flex-col space-y-6">
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Application Status - Main Component) */}
          <div className="lg:col-span-2 space-y-6">
            {application && <ApplicationStatusCard application={application} />}
          </div>

          {/* Right Column (Overview & Job Details) */}
          <div className="space-y-6">
            {application && (
              <ApplicationJobOverviewCard application={application} />
            )}
            {application && (
              <ApplicationJobDetailsCard application={application} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
