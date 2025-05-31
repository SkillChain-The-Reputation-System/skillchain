import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip";

import { JobApplicationStatus } from "@/constants/system";
import { JobApplicantionInterface } from "@/lib/interfaces";

interface TopApplicantsProps {
  jobsApplication: Record<string, JobApplicantionInterface[]>
}

export default function TopApplicants({ jobsApplication }: TopApplicantsProps) {
  const top5applicants = getTop5MostActiveApplicants(jobsApplication);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">Returning Applicants</CardTitle>
        <CardDescription>Applicants interested in your job postings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {top5applicants.map((applicant, index) => {
            return (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-300 dark:border-input rounded-lg">
                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={applicant.avatar_url || ""}
                            alt={applicant.address || "Applicant"}
                          />
                          <AvatarFallback>
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "AP"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{applicant.name || applicant.address}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      {applicant.address}
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-sm text-muted-foreground">{applicant.appliedCount} jobs applied</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface ApplicantJobCount {
  address: string;
  name: string;
  avatar_url: string;
  email?: string;
  appliedCount: number;
}

function getTop5MostActiveApplicants(jobsApplication: Record<string, JobApplicantionInterface[]>): ApplicantJobCount[] {
  const applicantMap = new Map<string, {
    address: string;
    name: string;
    avatar_url: string;
    jobIds: Set<string>;
  }>();

  Object.entries(jobsApplication).forEach(([jobId, applications]) => {
    applications.forEach(application => {
      if (application.status !== JobApplicationStatus.WITHDRAWN) {

        const applicantAddress = application.address;

        if (!applicantMap.has(applicantAddress)) {
          applicantMap.set(applicantAddress, {
            address: application.address,
            name: application.profile_data.fullname,
            avatar_url: application.profile_data.avatar_url,
            jobIds: new Set(),
          });
        }

        const applicant = applicantMap.get(applicantAddress)!;
        applicant.jobIds.add(jobId);
      }
    });
  });

  const applicantCounts: ApplicantJobCount[] = Array.from(applicantMap.values())
    .map(applicant => ({
      address: applicant.address,
      name: applicant.name,
      avatar_url: applicant.avatar_url,
      appliedCount: applicant.jobIds.size,
    }))
    .sort((a, b) => b.appliedCount - a.appliedCount)
    .slice(0, 5);

  return applicantCounts;
}