"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchJobApplicationByID } from "@/lib/fetching-onchain-data-utils";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  JobApplicationStatus,
  ApplicationStatusLabels,
  DomainLabels,
  Domain,
} from "@/constants/system";
import { DomainIconMap } from "@/constants/data";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingIcon,
  VideoIcon,
  CheckIcon,
  TrophyIcon,
} from "lucide-react";
import { format } from "date-fns";

// Mock data for demonstration
const mockUserData = {
  username: "JaneDoe",
  address: "0x1234...5678",
  avatarUrl: "https://github.com/shadcn.png",
  domainReputations: {
    [Domain.SOFTWARE_DEVELOPMENT]: 85,
    [Domain.DATA_SCIENCE_AND_ANALYTICS]: 72,
    [Domain.ARTIFICIAL_INTELLIGENCE]: 78,
    [Domain.BLOCKCHAIN_AND_CRYPTOCURRENCY]: 90,
  } as Record<Domain, number>,
  globalReputation: 82,
};

// Mock interview data
const mockInterviewData = {
  scheduledDate: new Date(2025, 5, 30, 14, 0), // June 30, 2025, 2:00 PM
  duration: 60, // minutes
  meetingLink: "https://meet.google.com/abc-defg-hij",
  additionalNotes:
    "Please prepare a brief presentation about your previous projects",
};

import { PageHeader } from "@/components/layout/page-header";

export default function ApplicationDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const applicationId = params["applicant-id"] as string; // The parameter name is now "applicant-id"

  const [application, setApplication] =
    useState<JobApplicationWithJobDataInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] =
    useState<JobApplicationStatus | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);

  const handleStatusChange = (value: string) => {
    setApplicationStatus(parseInt(value) as JobApplicationStatus);
    // Here you would implement the logic to update the status in the blockchain
    console.log("Status changed to:", parseInt(value));
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
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

  // Format the application date
  const formattedAppliedDate = format(
    new Date(application.applied_at),
    "EEE dd MMM, yyyy hh:mm a"
  );
  return (
    <div className="px-4 pb-10 max-w-7xl mx-auto overflow-x-hidden">
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
          <Card>
            <CardHeader>
              <CardTitle>Applicant Profile</CardTitle>
              <CardDescription>Personal and reputation data</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={mockUserData.avatarUrl}
                  alt={mockUserData.username}
                />
                <AvatarFallback>
                  {mockUserData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center max-w-full">
                <h3 className="text-xl font-semibold">
                  {mockUserData.username}
                </h3>
                <div className="text-sm text-muted-foreground truncate">
                  {application.applicant}
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50">
                    Global Rep: {mockUserData.globalReputation}
                  </Badge>
                </div>
              </div>

              <Separator className="my-4" />
              <div className="w-full space-y-2 overflow-y-auto max-h-48">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Domain Reputation
                </h4>
                {Object.entries(mockUserData.domainReputations).map(
                  ([domain, score]) => {
                    const domainKey = domain as unknown as Domain;
                    const iconName = DomainIconMap[domainKey];
                    const DomainIcon = Icons[iconName as keyof typeof Icons];

                    return (
                      <div
                        key={domain}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {DomainIcon && (
                            <DomainIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm overflow-hidden text-ellipsis">
                            {DomainLabels[domainKey]}
                          </span>
                        </div>
                        <span className="font-medium ml-2">{score}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Job and Application Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Job & Application Details</CardTitle>
              <CardDescription>
                Overview of the job and application status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold overflow-hidden text-ellipsis mb-3">
                  {application.job.title}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <div className="text-right overflow-hidden truncate">
                      {application.job.location || "Remote"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">Job ID</span>
                    </div>
                    <div className="text-right overflow-hidden truncate">
                      {application.job.id}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">Applied</span>
                    </div>
                    <div className="text-right overflow-hidden truncate">
                      {formattedAppliedDate}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Application ID
                      </span>
                    </div>
                    <div className="text-right overflow-hidden truncate">
                      {application.id}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Application Status */}
              <div className="space-y-2">
                <h4 className="font-medium">Application Status</h4>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center">
                  <Select
                    value={applicationStatus?.toString()}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ApplicationStatusLabels).map(
                        ([status, label]) => (
                          <SelectItem key={status} value={status}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <Button className="w-full sm:w-auto sm:ml-auto">
                    Update Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Information</CardTitle>
              <CardDescription>Schedule and meeting details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationStatus === JobApplicationStatus.INTERVIEWING ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Date & Time
                      </h4>
                      <p className="font-medium">
                        {format(mockInterviewData.scheduledDate, "PPP")} at{" "}
                        {format(mockInterviewData.scheduledDate, "p")}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Duration
                      </h4>
                      <p className="font-medium">
                        {mockInterviewData.duration} minutes
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Meeting Link
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 overflow-hidden">
                      <VideoIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <a
                        href={mockInterviewData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        Join Video Call
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Notes
                    </h4>
                    <p className="break-words overflow-auto max-h-24">
                      {mockInterviewData.additionalNotes}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4 flex-wrap gap-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Reschedule
                    </Button>
                    <Button className="w-full sm:w-auto">Send Reminder</Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <p className="text-muted-foreground px-4">
                    {applicationStatus === JobApplicationStatus.SHORTLISTED
                      ? "This applicant has been shortlisted. Schedule an interview to proceed."
                      : "Interview information will be available once the application status is set to 'Interviewing'."}
                  </p>
                  {applicationStatus === JobApplicationStatus.SHORTLISTED && (
                    <Button className="w-full sm:w-auto">
                      Schedule Interview
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Requirements and Fit */}
          <Card>
            <CardHeader>
              <CardTitle>Qualifications & Fit Assessment</CardTitle>
              <CardDescription>
                Evaluate the candidate's fit for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Required Domains</h4>
                  <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-2">
                    {application.job.domains.map((domain) => {
                      const userScore =
                        mockUserData.domainReputations[domain] || 0;
                      const requiredScore =
                        application.job.domainReputations[domain] || 0;
                      const meetsRequirement = userScore >= requiredScore;
                      const iconName = DomainIconMap[domain];
                      const DomainIcon = Icons[iconName as keyof typeof Icons];
                      return (
                        <Badge
                          key={domain}
                          variant="default"
                          className="whitespace-nowrap flex items-center gap-1 select-none"
                        >
                          {DomainIcon && <DomainIcon className="h-3 w-3" />}
                          {DomainLabels[domain]}
                          <span>
                            {userScore}/{requiredScore}
                          </span>
                          <CheckIcon className="h-3 w-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                {application.job.requireGlobalReputation && (
                  <div>
                    <h4 className="font-medium">
                      Global Reputation Requirement
                    </h4>
                    <div className="mt-2">
                      <Badge
                        variant="default"
                        className="whitespace-nowrap flex items-center gap-1 select-none"
                      >
                        <TrophyIcon className="h-3 w-3" />
                        <span>Global Reputation</span>
                        <span>
                          {mockUserData.globalReputation}/
                          {application.job.globalReputationScore}
                        </span>
                        <CheckIcon className="h-3 w-3 ml-1" />
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="pt-4">
                  <h4 className="font-medium">Notes</h4>
                  <textarea
                    className="w-full mt-2 p-2 border rounded-md h-24 resize-none"
                    placeholder="Add notes about this applicant..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
