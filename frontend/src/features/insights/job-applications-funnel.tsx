import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import ProgressBar from "./progress-bar";
import { applicationStatusChartColor } from "@/constants/styles";
import { ApplicationStatusLabels, JobApplicationStatus } from "@/constants/system";

import { JobApplicantionInterface } from "@/lib/interfaces";

interface JobApplicationFunnelProps {
  jobsApplication: Record<string, JobApplicantionInterface[]>
}

export default function JobApplicationFunnel({ jobsApplication }: JobApplicationFunnelProps) {
  const totalApplication = Object.values(jobsApplication).flat().length;
  const chartData = generateApplicationStatusStatistics(jobsApplication);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">Application Funnel</CardTitle>
        <CardDescription>Candidate journey through hiring process</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-gray-400)' }} />
                <span className="text-sm font-medium">Total Applications</span>
              </div>
              <span className="text-sm text-gray-600">
                {totalApplication} (100%)
              </span>
            </div>
            <ProgressBar value={100} className="h-2" />
          </div>

          {chartData.map((stage) => {
            const percentage = (stage.quantity / totalApplication) * 100
            return (
              <div key={stage.status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.fill }} />
                    <span className="text-sm font-medium">{stage.status}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {stage.quantity} ({percentage.toFixed(2)}%)
                  </span>
                </div>
                <ProgressBar
                  value={percentage}
                  fillColor={stage.fill}
                  className="h-2"
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface JobApplicationStatusStat {
  status: string;
  quantity: number;
  fill: string;
}

function generateApplicationStatusStatistics(jobsApplication: Record<string, JobApplicantionInterface[]>) {
  type ActiveJobApplicationStatus =
    | JobApplicationStatus.PENDING
    | JobApplicationStatus.REVIEWING
    | JobApplicationStatus.SHORTLISTED
    | JobApplicationStatus.INTERVIEWING
    | JobApplicationStatus.HIRED;

  const statusCounts: Record<ActiveJobApplicationStatus, number> = {
    [JobApplicationStatus.PENDING]: 0,
    [JobApplicationStatus.REVIEWING]: 0,
    [JobApplicationStatus.SHORTLISTED]: 0,
    [JobApplicationStatus.INTERVIEWING]: 0,
    [JobApplicationStatus.HIRED]: 0,
  };

  Object.values(jobsApplication)
    .flat()
    .forEach(application => {
      if (application.status !== JobApplicationStatus.REJECTED &&
        application.status !== JobApplicationStatus.WITHDRAWN) {
        statusCounts[application.status as ActiveJobApplicationStatus]++;
      }
    });

  const chartData: JobApplicationStatusStat[] = Object.entries(statusCounts)
    .map(([status, quantity]) => ({
      status: ApplicationStatusLabels[Number(status) as ActiveJobApplicationStatus],
      quantity: quantity,
      fill: applicationStatusChartColor[Number(status) as ActiveJobApplicationStatus]
    }));

  return chartData;
}