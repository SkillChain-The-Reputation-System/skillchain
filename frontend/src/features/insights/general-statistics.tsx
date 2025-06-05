import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import {
  Briefcase,
  Target,
  TvMinimal,
  Users
} from "lucide-react";

import { JobPreviewInterface, BriefMeetingInterface, BriefJobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus, JobStatus, MeetingStatus } from "@/constants/system";

interface GeneralStatisticsProps {
  jobs: JobPreviewInterface[],
  meetings: BriefMeetingInterface[],
  jobsApplication: Record<string, BriefJobApplicationInterface[]>
}

export default function GeneralStatistics({ jobs, meetings, jobsApplication }: GeneralStatisticsProps) {
  const activeJobs = jobs.filter(job => job.status === JobStatus.OPEN).length;
  const totalApplicants = jobs.reduce((total, job) => total + job.applicants, 0);
  const pendingMeetings = meetings.filter(meeting => meeting.status === MeetingStatus.PENDING).length;
  const hiredApplicants = Object.values(jobsApplication).flat().filter(application => application.status === JobApplicationStatus.HIRED).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm">Active Jobs</CardTitle>
          <Briefcase className="h-4 w-4 stroke-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeJobs}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm">Total Applicants</CardTitle>
          <Users className="h-4 w-4 stroke-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalApplicants}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm">Conversion Rate</CardTitle>
          <Target className="h-4 w-4 stroke-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{((hiredApplicants / totalApplicants) * 100).toFixed(2)} %</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm">Pending Meetings</CardTitle>
          <TvMinimal className="h-4 w-4 stroke-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingMeetings}</div>
        </CardContent>
      </Card>
    </div>
  )
}