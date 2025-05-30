"use client";

import { MapPin, Briefcase, CalendarCheck, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobInterface } from "@/lib/interfaces";
import {
  JobStatus,
  JobStatusLabels,
  JobDurationLabels,
} from "@/constants/system";
import { JobStatusIconMap } from "@/constants/data";
import { jobStatusIconStyles, jobStatusStyles } from "@/constants/styles";
import { Icons } from "@/components/icons";

interface JobDetailsCardProps {
  job: JobInterface;
  possibleStatuses: JobStatus[];
  statusLoading: boolean;
  onStatusChange: (status: JobStatus) => void;
  removePointerEventsFromBody: () => void;
}

export default function JobDetailsCard({
  job,
  possibleStatuses,
  statusLoading,
  onStatusChange,
  removePointerEventsFromBody,
}: JobDetailsCardProps) {
  // Get status icon
  const getStatusIcon = (status: JobStatus) => {
    const iconName = JobStatusIconMap[status];
    if (!iconName) return null;

    const IconComponent = Icons[iconName as keyof typeof Icons];
    if (!IconComponent) return null;

    return (
      <IconComponent className={`h-6 w-6 ${jobStatusIconStyles[status]}`} />
    );
  };

  const getStatusColor = (status: JobStatus) => {
    return jobStatusStyles[status];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Job Details</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 focus:outline-none ${
                  possibleStatuses.length === 0 || statusLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                disabled={possibleStatuses.length === 0 || statusLoading}
                type="button"
              >
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    job.status
                  )}`}
                >
                  {JobStatusLabels[job.status] || "Unknown"}
                </span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {possibleStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  className={`flex items-center gap-2 ${
                    status === job.status ? "font-bold" : ""
                  }`}
                  onClick={() => {
                    removePointerEventsFromBody();
                    onStatusChange(status);
                  }}
                >
                  {getStatusIcon(status)}
                  <span>{JobStatusLabels[status]}</span>
                </DropdownMenuItem>
              ))}
              {possibleStatuses.length === 0 && (
                <DropdownMenuItem disabled>
                  No status changes available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500" />
            <span className="truncate" title={job.location || "Unknown"}>
              {job.location || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <span
              className="truncate"
              title={JobDurationLabels[job.duration] || "Unknown"}
            >
              {JobDurationLabels[job.duration]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-slate-500" />
            <span
              className="truncate"
              title={
                job.deadline
                  ? `Apply by ${new Date(job.deadline).toLocaleDateString()}`
                  : "No deadline"
              }
            >
              {job.deadline
                ? `Apply by ${new Date(job.deadline).toLocaleDateString()}`
                : "No deadline"}
            </span>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              {job.description ? (
                <div
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <p className="text-slate-500 italic">
                  No description provided.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="requirements" className="pt-6">
            <div className="prose max-w-none">
              {job.requirements ? (
                <div
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              ) : (
                <p className="text-slate-500 italic">
                  No requirements specified.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="compensation" className="pt-6">
            <div className="prose max-w-none">
              {job.compensation ? (
                <div
                  style={{
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: job.compensation }}
                />
              ) : (
                <p className="text-slate-500 italic">
                  No compensation details provided.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
