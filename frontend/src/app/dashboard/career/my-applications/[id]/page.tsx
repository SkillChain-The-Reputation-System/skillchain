"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Clock,
  Users,
  CalendarCheck,
  Building,
  Calendar,
  Award,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { fetchJobApplicationByID } from "@/lib/fetching-onchain-data-utils";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import {
  JobStatus,
  JobStatusLabels,
  JobApplicationStatus,
  ApplicationStatusLabels,
  JobDurationLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { format, differenceInDays, formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

// Helper components
const ApplicationStatusBadge = ({
  status,
}: {
  status: JobApplicationStatus;
}) => {
  // Status color mapping with dark mode support
  const getStatusColor = (status: JobApplicationStatus) => {
    switch (status) {
      case JobApplicationStatus.PENDING:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      case JobApplicationStatus.REVIEWING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case JobApplicationStatus.SHORTLISTED:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case JobApplicationStatus.INTERVIEWING:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case JobApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case JobApplicationStatus.WITHDRAWN:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case JobApplicationStatus.HIRED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Badge
      className={`${getStatusColor(status)} px-3 py-1 text-xs font-medium`}
    >
      {ApplicationStatusLabels[status]}
    </Badge>
  );
};

const JobStatusBadge = ({ status }: { status: JobStatus }) => {
  // Status color mapping with dark mode support
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case JobStatus.PAUSED:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case JobStatus.CLOSED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case JobStatus.FILLED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case JobStatus.DRAFT:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      case JobStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  return (
    <Badge
      className={`${getStatusColor(status)} px-3 py-1 text-xs font-medium`}
    >
      {JobStatusLabels[status]}
    </Badge>
  );
};

const ReputationRequirement = ({
  required,
  userValue,
  label,
}: {
  required: number | undefined;
  userValue: number;
  label: string;
}) => {
  const isMet = userValue >= (required || 0);

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm ${
            isMet
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {userValue} / {required}
        </span>
        {isMet ? (
          <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-xs">
              ✓
            </span>
          </div>
        ) : (
          <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400 text-xs">⚠</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Timeline component for application status history
const StatusTimeline = ({
  application,
}: {
  application: JobApplicationWithJobDataInterface;
}) => {
  // Mock status history - in a real implementation, this would come from the application
  const statusHistory = [
    {
      status: JobApplicationStatus.PENDING,
      date: new Date(application.applied_at),
      isActive: true,
    },
    // Additional mock statuses based on current status
    ...(application.status >= JobApplicationStatus.REVIEWING
      ? [
          {
            status: JobApplicationStatus.REVIEWING,
            date: new Date(application.applied_at + 86400000), // 1 day after applying
            isActive: true,
          },
        ]
      : []),
    ...(application.status >= JobApplicationStatus.SHORTLISTED
      ? [
          {
            status: JobApplicationStatus.SHORTLISTED,
            date: new Date(application.applied_at + 172800000), // 2 days after applying
            isActive: true,
          },
        ]
      : []),
    ...(application.status >= JobApplicationStatus.INTERVIEWING
      ? [
          {
            status: JobApplicationStatus.INTERVIEWING,
            date: new Date(application.applied_at + 259200000), // 3 days after applying
            isActive: true,
          },
        ]
      : []),
    ...(application.status === JobApplicationStatus.HIRED
      ? [
          {
            status: JobApplicationStatus.HIRED,
            date: new Date(application.applied_at + 345600000), // 4 days after applying
            isActive: true,
          },
        ]
      : []),
    ...(application.status === JobApplicationStatus.REJECTED
      ? [
          {
            status: JobApplicationStatus.REJECTED,
            date: new Date(application.applied_at + 345600000), // 4 days after applying
            isActive: true,
          },
        ]
      : []),
    ...(application.status === JobApplicationStatus.WITHDRAWN
      ? [
          {
            status: JobApplicationStatus.WITHDRAWN,
            date: new Date(application.applied_at + 345600000), // 4 days after applying
            isActive: true,
          },
        ]
      : []),
  ];
  return (
    <div className="relative space-y-4 pl-6 pt-1 pb-2">
      {/* Timeline line */}
      <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

      {statusHistory.map((item, index) => (
        <div key={index} className="relative flex items-start gap-2">
          {/* Timeline node */}
          <div
            className={`absolute left-[-20px] top-1 h-4 w-4 rounded-full border-2 ${
              item.isActive
                ? "bg-blue-500 border-blue-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            }`}
          ></div>

          {/* Content */}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {ApplicationStatusLabels[item.status]}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(item.date, "MMM d, yyyy h:mm a")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] =
    useState<JobApplicationWithJobDataInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const applicationId = params.id as string;

  // Mock user reputation data
  const userGlobalRep = 120;
  const userDomainRep: Record<number, number> = {
    [Domain.SOFTWARE_DEVELOPMENT]: 150,
    [Domain.DATA_SCIENCE_AND_ANALYTICS]: 80,
    [Domain.ARTIFICIAL_INTELLIGENCE]: 95,
  };

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
    // This would be implemented with actual blockchain interaction
    toast.info("Application withdrawal feature will be implemented soon.");

    // Mock implementation for UI demo
    /*
    try {
      // await withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully!");
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
    */
  };

  if (loading) {
    return (
      <div className="container py-10 space-y-6">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-52 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container py-10">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The requested application could not be found.
          </p>
          <Button
            onClick={() => router.push("/dashboard/career/my-applications")}
          >
            Return to My Applications
          </Button>
        </div>
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
    <div className="container py-6 space-y-6">
      {/* Page Header & Breadcrumbs */}
      <PageHeader
        title={`Application for ${application.job.title}`}
        description="View and manage your job application"
        actions={
          application.status !== JobApplicationStatus.WITHDRAWN &&
          application.status !== JobApplicationStatus.HIRED &&
          application.status !== JobApplicationStatus.REJECTED && (
            <Button variant="withdraw" onClick={handleWithdrawApplication}>
              Withdraw Application
            </Button>
          )
        }
      />
      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Job Summary) */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Card */}
          <Card>
            <CardContent className="pt-6">
              {/* Title & Recruiter */}
              <div className="space-y-4 mb-6">
                <h1 className="text-2xl font-bold">{application.job.title}</h1>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">
                    {application.job.recruiter}
                  </span>
                </div>
              </div>
              {/* Key facts row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {application.job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span
                      className="text-sm truncate"
                      title={application.job.location}
                    >
                      {application.job.location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate">
                    Posted{" "}
                    {formatDistanceToNow(new Date(application.job.posted), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span
                    className="text-sm truncate"
                    title={JobDurationLabels[application.job.duration]}
                  >
                    {JobDurationLabels[application.job.duration]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {application.job.applicants} applicants
                  </span>
                </div>
              </div>
              {/* Status & Deadline */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Job Status:</span>
                  <JobStatusBadge status={application.job.status} />
                </div>

                {deadlineDaysLeft !== null && (
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span
                      className={`text-sm font-medium ${
                        deadlineDaysLeft < 0
                          ? "text-red-600 dark:text-red-400"
                          : deadlineDaysLeft < 3
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {deadlineDisplay}
                    </span>
                  </div>
                )}
              </div>
              {/* Domain & Reputation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Domains & Skills</h3>
                {/* Domain tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {application.job.domains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="outline"
                      className="bg-slate-50 dark:bg-slate-800/50 transition-colors duration-150 hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-200 cursor-pointer"
                    >
                      {DomainLabels[domain]}
                    </Badge>
                  ))}
                </div>
                {/* Reputation requirements */}
                {application.job.requireGlobalReputation && (
                  <div className="p-4 border rounded-lg space-y-3 dark:border-gray-700">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Reputation Requirements
                    </h4>

                    <ReputationRequirement
                      required={application.job.globalReputationScore}
                      userValue={userGlobalRep}
                      label="Global Reputation"
                    />
                    {Object.entries(application.job.domainReputations)
                      .filter(([_, score]) => score > 0)
                      .map(([domainStr, score]) => {
                        const domain = parseInt(domainStr) as Domain;
                        return (
                          <ReputationRequirement
                            key={domain}
                            required={score}
                            userValue={userDomainRep[domain as number] || 0}
                            label={DomainLabels[domain]}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
              {/* Compensation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Compensation</h3>
                <div className="p-4 border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-base font-semibold">
                      {application.job.compensation}
                    </span>
                  </div>
                </div>
              </div>
              {/* Job Details Accordion */}
              <Accordion type="single" collapsible defaultValue="description">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-base font-medium">
                    Description
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: application.job.description,
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="requirements">
                  <AccordionTrigger className="text-base font-medium">
                    Requirements
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: application.job.requirements,
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Your Application) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Application ID & Applied on date */}
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <div>
                  Application ID: {application.id.slice(0, 8)}...
                  {application.id.slice(-6)}
                </div>
                <div>
                  Applied on:{" "}
                  {format(
                    new Date(application.applied_at),
                    "MMM d, yyyy h:mm a"
                  )}
                </div>
              </div>
              {/* Current status badge */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Current Status</h3>
                <ApplicationStatusBadge status={application.status} />
              </div>
              {/* Status Timeline */}
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-4">Status Timeline</h3>
                <StatusTimeline application={application} />
              </div>
              {/* Next Steps Panel */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                <h3 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">
                  Next Steps
                </h3>

                {application.status === JobApplicationStatus.PENDING && (
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your application is being reviewed. We'll update you soon.
                  </p>
                )}

                {application.status === JobApplicationStatus.REVIEWING && (
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your application is in review. Please check back in a few
                    days.
                  </p>
                )}

                {application.status === JobApplicationStatus.SHORTLISTED && (
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Congratulations! You've been shortlisted. Prepare for a
                    potential interview.
                  </p>
                )}

                {application.status === JobApplicationStatus.INTERVIEWING && (
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                    <p>
                      Interview scheduled for June 1, 2025 at 10:00 AM in Zoom.
                    </p>
                    <p>Please check your email for the meeting link.</p>
                  </div>
                )}

                {application.status === JobApplicationStatus.REJECTED && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-800 dark:text-gray-300">
                      Thank you for your interest. Unfortunately, we've decided
                      to pursue other candidates for this position.
                    </p>
                  </div>
                )}

                {application.status === JobApplicationStatus.WITHDRAWN && (
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    You've withdrawn your application for this position.
                  </p>
                )}

                {application.status === JobApplicationStatus.HIRED && (
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Congratulations! You've been hired. Please check your email
                    for next steps.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
