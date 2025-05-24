"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Clock, Users, CalendarCheck } from "lucide-react";
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";
import { format } from "date-fns";

interface JobOverviewCardProps {
  job: JobInterface;
}

export default function JobOverviewCard({ job }: JobOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Location</span>
          </div>
          <span className="text-sm font-medium truncate max-w-[120px]" title={job.location || "Remote"}>
            {job.location || "Remote"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Duration</span>
          </div>
          <span className="text-sm font-medium">
            {JobDurationLabels[job.duration]}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Applicants</span>
          </div>
          <span className="text-sm font-medium">
            {job.applicants} candidates
          </span>
        </div>
        {job.deadline > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Deadline</span>
            </div>
            <span className="text-sm font-medium">
              {format(new Date(job.deadline), "MMM d, yyyy h:mm a")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
