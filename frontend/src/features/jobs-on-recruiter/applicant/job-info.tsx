"use client";

import { format } from "date-fns";
import { MapPin, Clock, Users, CalendarCheck } from "lucide-react";
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";

interface JobInfoProps {
  job: JobInterface;
}

export default function JobInfo({ job }: JobInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Location
          </p>
          <p
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
            title={job.location || "Remote"}
          >
            {job.location || "Remote"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Duration
          </p>
          <p
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
            title={
              job.duration !== undefined
                ? JobDurationLabels[job.duration]
                : "Unspecified"
            }
          >
            {job.duration !== undefined
              ? JobDurationLabels[job.duration]
              : "Unspecified"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Applicants
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {job.applicants} {job.applicants === 1 ? "candidate" : "candidates"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
          <CalendarCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Deadline
          </p>
          <p
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
            title={
              job.deadline
                ? `Apply by ${format(new Date(job.deadline), "MMMM d, yyyy")}`
                : "No deadline"
            }
          >
            {job.deadline
              ? format(new Date(job.deadline), "MMM d, yyyy")
              : "No deadline"}
          </p>
        </div>
      </div>
    </div>
  );
}
