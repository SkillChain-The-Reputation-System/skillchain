"use client";

import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { JobInterface } from "@/lib/interfaces";
import { JobStatus, JobStatusLabels } from "@/constants/system";
import { JobStatusIconMap } from "@/constants/data";
import { jobStatusHoverStyles } from "@/constants/styles";
import { Icons } from "@/components/icons";

interface JobStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobInterface | null;
  newStatus: JobStatus | null;
  statusLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function JobStatusDialog({
  isOpen,
  onOpenChange,
  job,
  newStatus,
  statusLoading,
  onConfirm,
  onCancel,
}: JobStatusDialogProps) {
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

  // Get status icon
  const getStatusIcon = (status: JobStatus) => {
    const iconName = JobStatusIconMap[status];
    if (!iconName) return null;
    
    const IconComponent = Icons[iconName as keyof typeof Icons];
    if (!IconComponent) return null;
    
    return <IconComponent className="h-6 w-6" />;
  };

  // Get button color for status
  const getStatusButtonColor = (status: JobStatus) => {
    return jobStatusHoverStyles[status];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Job Status</DialogTitle>
          <DialogDescription>
            {job && newStatus
              ? getStatusChangeMessage(job.status, newStatus)
              : "Change the status of this job?"}
          </DialogDescription>
        </DialogHeader>

        {job && newStatus && (
          <div className="flex justify-center items-center gap-5 py-6">
            <div className="flex flex-col items-center">
              {getStatusIcon(job.status)}
              <span className="mt-2 text-sm font-medium">
                {JobStatusLabels[job.status]}
              </span>
            </div>

            <ArrowLeftIcon className="h-5 w-5 transform rotate-180" />

            <div className="flex flex-col items-center">
              {getStatusIcon(newStatus)}
              <span className="mt-2 text-sm font-medium">
                {JobStatusLabels[newStatus]}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
            disabled={statusLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={statusLoading}
            className={cn(
              newStatus ? getStatusButtonColor(newStatus) : "",
              "cursor-pointer"
            )}
          >
            {statusLoading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Processing...
              </>
            ) : (
              "Confirm Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
