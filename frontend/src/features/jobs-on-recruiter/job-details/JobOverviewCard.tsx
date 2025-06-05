"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  CalendarCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";

interface JobOverviewCardProps {
  job: JobInterface;
  jobId: string;
}

interface JobDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function JobDetailItem({ icon, label, value }: JobDetailItemProps) {
  const shouldTruncate = value.length > 20;

  const content = (
    <div className="grid grid-cols-2 gap-4 items-center py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex justify-end">
        <span 
          className={`text-sm text-right ${
            shouldTruncate ? 'truncate max-w-[150px] sm:max-w-[200px]' : ''
          }`}
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

export default function JobOverviewCard({ job, jobId }: JobOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Overview</CardTitle>
      </CardHeader>      <CardContent className="space-y-1">
        <JobDetailItem
          icon={<Calendar className="h-4 w-4 text-slate-500" />}
          label="Posted"
          value={format(job.posted, "MMM d, yyyy h:mm a")}
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
        <JobDetailItem
          icon={<DollarSign className="h-4 w-4 text-slate-500" />}
          label="Compensation"
          value={job.compensation ? "Available" : "Not specified"}
        />
        <JobDetailItem
          icon={<CalendarCheck className="h-4 w-4 text-slate-500" />}
          label="Deadline"
          value={job.deadline
            ? format(new Date(job.deadline), "MMM d, yyyy h:mm a")
            : "None"}
        />
      </CardContent>
      <CardFooter>
        <div className="flex flex-col w-full gap-3">
          <Link
            href={`/recruiter/jobs/${jobId}/applicants`}
            className="w-full"
          >
            <Button className="w-full cursor-pointer">View Applicants</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
