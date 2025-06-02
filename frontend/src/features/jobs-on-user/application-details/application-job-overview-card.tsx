"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, CalendarCheck, Building } from "lucide-react";
import { JobInterface, JobApplicationInterface } from "@/lib/interfaces";
import { JobDurationLabels, JobStatus, JobStatusLabels } from "@/constants/system";
import { jobStatusStyles } from "@/constants/styles";
import { format, differenceInDays } from "date-fns";

interface ApplicationJobOverviewCardProps {
  application: JobApplicationInterface;
}

interface JobDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function JobDetailItem({ icon, label, value }: JobDetailItemProps) {
  const shouldTruncate = value.length > 15;

  const content = (
    <div className="grid grid-cols-2 gap-4 items-center py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex justify-end">
        <span 
          className="text-sm text-right truncate max-w-[120px] sm:max-w-[150px]"
        >
          {value}
        </span>
      </div>
    </div>
  );

  if (shouldTruncate) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-words">{value}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const getStatusColor = (status: JobStatus) => {
    return jobStatusStyles[status];
  };

  return (
    <Badge
      className={`${getStatusColor(status)} px-3 py-1 text-xs font-medium`}
    >
      {JobStatusLabels[status]}
    </Badge>
  );
}

export default function ApplicationJobOverviewCard({ application }: ApplicationJobOverviewCardProps) {
  const job = application.job;

  // Calculate days left until deadline
  const deadlineDaysLeft = job.deadline
    ? differenceInDays(new Date(job.deadline), new Date())
    : null;

  // Format deadline display
  const deadlineDisplay =
    deadlineDaysLeft !== null
      ? deadlineDaysLeft > 0
        ? `${deadlineDaysLeft} days left`
        : "Deadline passed"
      : "No deadline";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <JobDetailItem
          icon={<Building className="h-4 w-4 text-slate-500" />}
          label="Recruiter"
          value={job.recruiter}
        />
        <JobDetailItem
          icon={<MapPin className="h-4 w-4 text-slate-500" />}
          label="Location"
          value={job.location || "Remote"}
        />
        <JobDetailItem
          icon={<Clock className="h-4 w-4 text-slate-500" />}
          label="Duration"
          value={JobDurationLabels[job.duration]}
        />
        <JobDetailItem
          icon={<Users className="h-4 w-4 text-slate-500" />}
          label="Applicants"
          value={`${job.applicants} candidates`}
        />
        {job.deadline > 0 && (
          <JobDetailItem
            icon={<CalendarCheck className="h-4 w-4 text-slate-500" />}
            label="Deadline"
            value={format(new Date(job.deadline), "MMM d, yyyy h:mm a")}
          />
        )}
        
        {/* Job Status */}
        <div className="grid grid-cols-2 gap-4 items-center py-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className="flex justify-end">
            <JobStatusBadge status={job.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
