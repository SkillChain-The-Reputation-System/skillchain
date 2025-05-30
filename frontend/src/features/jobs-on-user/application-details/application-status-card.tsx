"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Calendar,
  CheckIcon,
  XIcon,
  TrophyIcon,
  User,
  Clock,
  FileText,
  Award,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import {
  JobApplicationInterface,
  UserReputationScoreInterface,
} from "@/lib/interfaces";
import {
  JobApplicationStatus,
  ApplicationStatusLabels,
  Domain,
  DomainLabels,
} from "@/constants/system";
import { applicationStatusStyles } from "@/constants/styles";
import { DomainIconMap } from "@/constants/data";
import { Icons } from "@/components/icons";
import { format } from "date-fns";
import { getUserReputationScore } from "@/lib/get/get-reputation-score-utils";

interface ApplicationStatusCardProps {
  application: JobApplicationInterface;
}

interface ApplicationStatusBadgeProps {
  status: JobApplicationStatus;
}

function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const getStatusColor = (status: JobApplicationStatus) => {
    return applicationStatusStyles[status];
  };

  return (
    <Badge
      className={`${getStatusColor(
        status
      )} px-3 py-1 text-xs font-medium select-none`}
    >
      {ApplicationStatusLabels[status]}
    </Badge>
  );
}

export default function ApplicationStatusCard({
  application,
}: ApplicationStatusCardProps) {
  const { address } = useAccount();
  const job = application.job;

  // State for reputation data
  const [reputationData, setReputationData] =
    useState<UserReputationScoreInterface | null>(null);
  const [isLoadingReputation, setIsLoadingReputation] = useState(true);
  const [reputationError, setReputationError] = useState<string | null>(null);

  // Fetch reputation data when component mounts
  useEffect(() => {
    const fetchReputationData = async () => {
      if (!address) {
        setIsLoadingReputation(false);
        return;
      }

      try {
        setIsLoadingReputation(true);
        setReputationError(null);
        const data = await getUserReputationScore(address);
        setReputationData(data);
      } catch (error) {
        console.error("Error fetching reputation scores:", error);
        setReputationError("Failed to load reputation data");
      } finally {
        setIsLoadingReputation(false);
      }
    };

    fetchReputationData();
  }, [address]);
  // Extract reputation values with fallbacks
  const userGlobalRep = reputationData?.global_reputation || 0;
  const userDomainRep =
    reputationData?.domain_reputation || ({} as Record<Domain, number>);

  const getNextStepsMessage = () => {
    switch (application.status) {
      case JobApplicationStatus.PENDING:
        return "Your application is being reviewed. We'll update you soon.";
      case JobApplicationStatus.REVIEWING:
        return "Your application is in review. Please check back in a few days.";
      case JobApplicationStatus.SHORTLISTED:
        return "Congratulations! You've been shortlisted. Prepare for a potential interview.";
      case JobApplicationStatus.INTERVIEWED:
        return "Thank you for your interview. We're currently evaluating candidates.";
      case JobApplicationStatus.REJECTED:
        return "Thank you for your interest. Unfortunately, we've decided to pursue other candidates for this position.";
      case JobApplicationStatus.WITHDRAWN:
        return "You've withdrawn your application for this position.";
      case JobApplicationStatus.HIRED:
        return "Congratulations! You've been hired. Please check your email for next steps.";
      default:
        return "Status update pending.";
    }
  };

  const getNextStepsIcon = () => {
    switch (application.status) {
      case JobApplicationStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case JobApplicationStatus.REVIEWING:
        return <Clock className="h-4 w-4" />;
      case JobApplicationStatus.SHORTLISTED:
        return <CheckCircle2 className="h-4 w-4" />;
      case JobApplicationStatus.INTERVIEWED:
        return <Calendar className="h-4 w-4" />;
      case JobApplicationStatus.REJECTED:
        return <AlertTriangle className="h-4 w-4" />;
      case JobApplicationStatus.WITHDRAWN:
        return <XIcon className="h-4 w-4" />;
      case JobApplicationStatus.HIRED:
        return <Award className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Application</CardTitle>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Application ID:</span>
            </div>
            <div className="text-sm truncate font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              {application.id}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CalendarDays className="h-4 w-4" />
              <span className="font-medium">Applied on:</span>
            </div>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
              {format(
                new Date(application.applied_at),
                "MMM d, yyyy 'at' h:mm a"
              )}
            </div>
          </div>
        </div>
        <Separator />
      </CardContent>
      <CardContent>
        {/* Reputation Requirements */}
        {job.requireGlobalReputation && (
          <div className="mb-4 space-y-4">
            {/* Global Reputation Requirement */}
            <CardTitle>Global Reputation Requirement</CardTitle>
            <div>
              {isLoadingReputation ? (
                <Badge
                  variant="outline"
                  className="whitespace-nowrap flex items-center gap-1 select-none"
                >
                  <TrophyIcon className="h-3 w-3" />
                  <span>Loading reputation...</span>
                </Badge>
              ) : reputationError ? (
                <Badge
                  variant="destructive"
                  className="whitespace-nowrap flex items-center gap-1 select-none"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Error loading reputation</span>
                </Badge>
              ) : (
                (() => {
                  const userGlobalReputation = userGlobalRep;
                  const requiredGlobalRep = job.globalReputationScore || 0;
                  const meetsGlobalRequirement =
                    userGlobalReputation >= requiredGlobalRep;

                  return (
                    <Badge
                      variant={
                        meetsGlobalRequirement ? "default" : "destructive"
                      }
                      className="whitespace-nowrap flex items-center gap-1 select-none"
                    >
                      <TrophyIcon className="h-3 w-3" />
                      <span>Global Reputation</span>
                      <span>
                        {userGlobalReputation}/{requiredGlobalRep}
                      </span>
                      {meetsGlobalRequirement ? (
                        <CheckIcon className="h-3 w-3 ml-1 text-green-600" />
                      ) : (
                        <XIcon className="h-3 w-3 ml-1 text-red-600" />
                      )}
                    </Badge>
                  );
                })()
              )}
            </div>

            {/* Domain Reputation Requirements */}
            {Object.keys(job.domainReputations).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Required Domains</h4>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                  {isLoadingReputation ? (
                    <Badge
                      variant="outline"
                      className="whitespace-nowrap flex items-center gap-1 select-none"
                    >
                      <span>Loading domain reputation...</span>
                    </Badge>
                  ) : reputationError ? (
                    <Badge
                      variant="destructive"
                      className="whitespace-nowrap flex items-center gap-1 select-none"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span>Error loading domain reputation</span>
                    </Badge>
                  ) : (
                    Object.entries(job.domainReputations).map(
                      ([domainStr, requiredScore]) => {
                        const domain = parseInt(domainStr) as Domain;
                        const userScore = userDomainRep[domain] || 0;
                        const meetsRequirement = userScore >= requiredScore;
                        const iconName = DomainIconMap[domain];
                        const DomainIcon =
                          Icons[iconName as keyof typeof Icons];

                        return (
                          <Badge
                            key={domain}
                            variant={
                              meetsRequirement ? "default" : "destructive"
                            }
                            className="whitespace-nowrap flex items-center gap-1 select-none"
                          >
                            {DomainIcon && <DomainIcon className="h-3 w-3" />}
                            {DomainLabels[domain]}
                            <span>
                              {userScore}/{requiredScore}
                            </span>
                            {meetsRequirement ? (
                              <CheckIcon className="h-3 w-3 ml-1 text-green-600" />
                            ) : (
                              <XIcon className="h-3 w-3 ml-1 text-red-600" />
                            )}
                          </Badge>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />
      </CardContent>

      <CardContent>
        {/* Status alert */}
        <Alert className={applicationStatusStyles[application.status]}>
          {getNextStepsIcon()}
          <AlertDescription className="text-inherit/70">
            {getNextStepsMessage()}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
