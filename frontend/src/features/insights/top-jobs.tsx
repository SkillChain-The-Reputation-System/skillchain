import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobApplicationStatus } from "@/constants/system";

import { JobApplicantionInterface, JobPreviewInterface } from "@/lib/interfaces";

interface TopJobsProps {
  jobs: JobPreviewInterface[],
  jobsApplication: Record<string, JobApplicantionInterface[]>
}

export default function TopJobs({ jobs, jobsApplication }: TopJobsProps) {
  const top5jobs = getTop5JobsWithBestPerformance(jobs, jobsApplication);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">Top Performing Jobs</CardTitle>
        <CardDescription>Jobs with highest application rates and conversions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {top5jobs.map((jobApp, index) => {
            const conversion = jobApp.hired / jobApp.totalApplicant * 100;

            return (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-300 dark:border-input rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{jobApp.title}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{jobApp.totalApplicant} applications</span>
                    <span>{jobApp.hired} hired</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={conversion > 30 ? "default" : "secondary"}>
                    {conversion.toFixed(2)} % conversion
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface JobApplicationCount {
  title: string | undefined;
  totalApplicant: number;
  hired: number;
}

function getTop5JobsWithBestPerformance(
  jobs: JobPreviewInterface[],
  jobsApplication: Record<string, JobApplicantionInterface[]>
): JobApplicationCount[] {
  const jobCounts: JobApplicationCount[] = Object.entries(jobsApplication)
    .map(([jobId, applications]) => {
      const activeApplications = applications.filter(app =>
        app.status !== JobApplicationStatus.WITHDRAWN
      );

      return {
        title: jobs.find(job => job.id == jobId)?.title,
        totalApplicant: activeApplications.length,
        hired: applications.filter(app => app.status === JobApplicationStatus.HIRED).length
      };
    });

  return jobCounts
    .sort((a, b) => b.totalApplicant - a.totalApplicant)
    .slice(0, 5);
}