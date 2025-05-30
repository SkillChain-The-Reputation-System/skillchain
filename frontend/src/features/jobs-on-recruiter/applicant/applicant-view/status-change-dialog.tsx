"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { JobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { ApplicationStatusLabels } from "@/constants/system";
import {
  applicationStatusHoverStyles,
  applicationStatusIconStyles,
} from "@/constants/styles";
import { ApplicationStatusIconMap } from "@/constants/data";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StatusChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplicationInterface | null;
  newStatus: JobApplicationStatus | null;
  onConfirm: () => void;
  statusLoading: boolean;
  onCancel: () => void;
}

export default function StatusChangeDialog({
  isOpen,
  onOpenChange,
  application,
  newStatus,
  onConfirm,
  statusLoading,
  onCancel,
}: StatusChangeDialogProps) {
  // Get status change message based on the new status
  const getStatusChangeMessage = (
    currentStatus: JobApplicationStatus,
    newStatus: JobApplicationStatus
  ): string => {
    switch (newStatus) {
      case JobApplicationStatus.REVIEWING:
        return "Moving this application to reviewing stage will indicate you're currently reviewing the candidate.";
      case JobApplicationStatus.SHORTLISTED:
        return "Shortlisting this candidate will move them to the next step in the hiring process.";
      case JobApplicationStatus.INTERVIEWED:
        return "Moving this application to interviewed stage means that you have completed the interview process with the candidate.";
      case JobApplicationStatus.REJECTED:
        return "Rejecting this application will notify the candidate that they are no longer being considered.";
      case JobApplicationStatus.HIRED:
        return "Accepting this candidate will notify them that they have been selected for the position.";
      case JobApplicationStatus.WITHDRAWN:
        return "Only candidates can withdraw their application. This status cannot be set by recruiters.";
      default:
        return "Are you sure you want to change the status of this application?";
    }
  };
  // Get status icon based on status
  const getStatusIcon = (status: JobApplicationStatus) => {
    const iconName =
      ApplicationStatusIconMap[status as keyof typeof ApplicationStatusIconMap];
    const IconComponent = Icons[iconName as keyof typeof Icons];

    if (status === JobApplicationStatus.WITHDRAWN) {
      return (
        <IconComponent
          className={`h-6 w-6 ${
            applicationStatusIconStyles[
              status as keyof typeof applicationStatusIconStyles
            ]
          } transform rotate-180`}
        />
      );
    }

    return IconComponent ? (
      <IconComponent
        className={`h-6 w-6 ${
          applicationStatusIconStyles[
            status as keyof typeof applicationStatusIconStyles
          ]
        }`}
      />
    ) : null;
  };

  // Get button color for status in dialog
  const getStatusButtonColor = (status: JobApplicationStatus) => {
    return applicationStatusHoverStyles[
      status as keyof typeof applicationStatusHoverStyles
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription>
            {application && newStatus
              ? getStatusChangeMessage(application.status, newStatus)
              : "Change the status of this application?"}
          </DialogDescription>
        </DialogHeader>

        {application && newStatus && (
          <div className="flex justify-center items-center gap-5 py-6">
            <div className="flex flex-col items-center">
              {getStatusIcon(application.status)}
              <span className="mt-2 text-sm font-medium">
                {
                  ApplicationStatusLabels[
                    application.status as keyof typeof ApplicationStatusLabels
                  ]
                }
              </span>
            </div>
            <ArrowLeftIcon className="h-5 w-5 transform rotate-180" />
            <div className="flex flex-col items-center">
              {getStatusIcon(newStatus)}
              <span className="mt-2 text-sm font-medium">
                {
                  ApplicationStatusLabels[
                    newStatus as keyof typeof ApplicationStatusLabels
                  ]
                }
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
