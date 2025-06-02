"use client";

import { useState } from "react";
import {
  MapPin,
  Briefcase,
  CalendarCheck,
  MoreHorizontal,
  ArrowLeftIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { JobInterface } from "@/lib/interfaces";
import {
  JobStatus,
  JobStatusLabels,
  JobDurationLabels,
} from "@/constants/system";
import { JobStatusIconMap } from "@/constants/data";
import {
  jobStatusIconStyles,
  jobStatusStyles,
  jobStatusHoverStyles,
} from "@/constants/styles";
import { Icons } from "@/components/icons";
import { updateJobStatus } from "@/lib/write-onchain-utils";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface JobDetailsCardProps {
  job: JobInterface;
  possibleStatuses: JobStatus[];
  statusLoading: boolean;
  onJobUpdate: () => Promise<void>;
  removePointerEventsFromBody: () => void;
}

export default function JobDetailsCard({
  job,
  possibleStatuses,
  statusLoading,
  onJobUpdate,
  removePointerEventsFromBody,
}: JobDetailsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get status change message
  const getStatusChangeMessage = (
    currentStatus: JobStatus,
    newStatus: JobStatus
  ): string => {
    switch (newStatus) {
      case JobStatus.OPEN:
        return currentStatus === JobStatus.DRAFT
          ? "Publishing this job will make it visible to all users."
          : "Resuming this job will make it visible to users again.";
      case JobStatus.PAUSED:
        return "Pausing this job will temporarily hide it from users.";
      case JobStatus.CLOSED:
        return "Closing this job will permanently end the application process.";
      case JobStatus.FILLED:
        return "Marking this job as filled will indicate that the position has been successfully filled.";
      case JobStatus.ARCHIVED:
        return "Archiving this job will move it to your archived jobs section.";
      default:
        return "Are you sure you want to change the status of this job?";
    }
  };

  // Get status button color for status
  const getStatusButtonColor = (status: JobStatus) => {
    return jobStatusHoverStyles[status];
  };
  // Handle status change confirmation
  const handleStatusChangeConfirm = async () => {
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      await updateJobStatus(job.id, selectedStatus);

      // Show success message
      toast.success(`Job status updated to ${JobStatusLabels[selectedStatus]}`);

      // Trigger parent component to reload fresh data
      await onJobUpdate();
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status. Please try again later.");
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
      setSelectedStatus(null);
    }
  };
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
                    setSelectedStatus(status);
                    setIsDialogOpen(true);
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

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Job Status</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus
                ? getStatusChangeMessage(job.status, selectedStatus)
                : "Change the status of this job?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedStatus && (
            <div className="flex justify-center items-center gap-5 py-6">
              <div className="flex flex-col items-center">
                {getStatusIcon(job.status)}
                <span className="mt-2 text-sm font-medium">
                  {JobStatusLabels[job.status]}
                </span>
              </div>

              <ArrowLeftIcon className="h-5 w-5 transform rotate-180" />

              <div className="flex flex-col items-center">
                {getStatusIcon(selectedStatus)}
                <span className="mt-2 text-sm font-medium">
                  {JobStatusLabels[selectedStatus]}
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isUpdating}
              onClick={() => {
                setSelectedStatus(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChangeConfirm}
              disabled={isUpdating}
              className={cn(
                selectedStatus ? getStatusButtonColor(selectedStatus) : "",
                "cursor-pointer"
              )}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Processing...
                </>
              ) : (
                "Confirm Change"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
