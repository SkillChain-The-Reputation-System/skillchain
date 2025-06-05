"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingIcon,
  MoreHorizontal,
  ArrowLeftIcon,
} from "lucide-react";
import { format } from "date-fns";
import { JobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { ApplicationStatusLabels } from "@/constants/system";
import {
  applicationStatusStyles,
  applicationStatusIconStyles,
  applicationStatusHoverStyles,
} from "@/constants/styles";
import { Icons } from "@/components/icons";
import { ApplicationStatusIconMap } from "@/constants/data";
import { updateJobApplicationStatus } from "@/lib/write-onchain-utils";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface JobApplicationDetailsCardProps {
  application: JobApplicationInterface;
  possibleStatuses: JobApplicationStatus[];
  statusLoading: boolean;
  onApplicationUpdate: () => Promise<void>;
  removePointerEventsFromBody: () => void;
}

export default function JobApplicationDetailsCard({
  application,
  possibleStatuses,
  statusLoading,
  onApplicationUpdate,
  removePointerEventsFromBody,
}: JobApplicationDetailsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<JobApplicationStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formattedAppliedDate = format(
    new Date(application.applied_at),
    "EEE dd MMM, yyyy hh:mm a"
  );

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

  // Get status button color for status in dialog
  const getStatusButtonColor = (status: JobApplicationStatus) => {
    return applicationStatusHoverStyles[
      status as keyof typeof applicationStatusHoverStyles
    ];
  };

  // Handle status change confirmation
  const handleStatusChangeConfirm = async () => {
    if (!selectedStatus) return;

    try {
      setIsUpdating(true);
      await updateJobApplicationStatus(application.id, selectedStatus);

      // Show success message
      toast.success(
        `Application status updated to ${
          ApplicationStatusLabels[
            selectedStatus as keyof typeof ApplicationStatusLabels
          ]
        }`
      );

      // Trigger parent component to reload fresh data
      await onApplicationUpdate();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        "Failed to update application status. Please try again later."
      );
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
      setSelectedStatus(null);
    }
  };
  const getStatusColor = (status: JobApplicationStatus) => {
    return applicationStatusStyles[
      status as keyof typeof applicationStatusStyles
    ];
  };

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
  const handleStatusChange = (status: JobApplicationStatus) => {
    removePointerEventsFromBody();
    setSelectedStatus(status);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job & Application Details</CardTitle>
          <CardDescription>
            Overview of the job and application status
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              application.status
            )}`}
          >
            {ApplicationStatusLabels[
              application.status as keyof typeof ApplicationStatusLabels
            ] || "Unknown"}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center focus:outline-none ${
                  possibleStatuses.length === 0 || statusLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                disabled={possibleStatuses.length === 0 || statusLoading}
                type="button"
              >
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {possibleStatuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  className={`flex items-center gap-2 cursor-pointer ${
                    status === application.status ? "font-bold" : ""
                  }`}
                  onClick={() => handleStatusChange(status)}
                >
                  {getStatusIcon(status)}
                  <span
                    className={
                      applicationStatusIconStyles[
                        status as keyof typeof applicationStatusIconStyles
                      ]
                    }
                  >
                    {
                      ApplicationStatusLabels[
                        status as keyof typeof ApplicationStatusLabels
                      ]
                    }
                  </span>
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
        <div className="space-y-4">
          <h3 className="text-xl font-semibold overflow-hidden text-ellipsis mb-3">
            {application.job.title}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <div className="text-right overflow-hidden truncate">
                {application.job.location || "Remote"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <BuildingIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">Job ID</span>
              </div>
              <div className="text-right overflow-hidden truncate">
                {application.job.id}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">Applied</span>
              </div>
              <div className="text-right overflow-hidden truncate">
                {formattedAppliedDate}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">Application ID</span>
              </div>
              <div className="text-right overflow-hidden truncate">
                {application.id}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus &&
                getStatusChangeMessage(application.status, selectedStatus)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedStatus && (
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
                {getStatusIcon(selectedStatus)}
                <span className="mt-2 text-sm font-medium">
                  {
                    ApplicationStatusLabels[
                      selectedStatus as keyof typeof ApplicationStatusLabels
                    ]
                  }
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedStatus(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChangeConfirm}
              className={cn(
                getStatusButtonColor(
                  selectedStatus || JobApplicationStatus.PENDING
                ),
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : `Change to ${
                    selectedStatus
                      ? ApplicationStatusLabels[
                          selectedStatus as keyof typeof ApplicationStatusLabels
                        ]
                      : ""
                  }`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
