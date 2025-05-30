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
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";

interface JobOverviewCardProps {
  job: JobInterface;
  jobId: string;
}

export default function JobOverviewCard({ job, jobId }: JobOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Posted</span>
          </div>
          <span className="text-sm font-medium">
            {format(job.posted, "MMM d, yyyy h:mm a")}
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Compensation</span>
          </div>
          <span className="text-sm font-medium">
            {job.compensation ? "Available" : "Not specified"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-slate-500" />
            <span className="text-sm">Deadline</span>
          </div>
          <span className="text-sm font-medium">
            {job.deadline
              ? format(new Date(job.deadline), "MMM d, yyyy h:mm a")
              : "None"}
          </span>
        </div>
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
