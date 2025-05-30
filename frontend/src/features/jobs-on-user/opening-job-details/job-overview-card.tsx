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
import { MapPin, Clock, Users, CalendarCheck } from "lucide-react";
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";
import { format } from "date-fns";

interface JobOverviewCardProps {
  job: JobInterface;
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

export default function JobOverviewCard({ job }: JobOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
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
      </CardContent>
    </Card>
  );
}
