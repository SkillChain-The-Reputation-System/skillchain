"use client";

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
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BuildingIcon,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { JobApplicationInterface } from "@/lib/interfaces";
import { JobApplicationStatus } from "@/constants/system";
import { ApplicationStatusLabels } from "@/constants/system";
import {
  applicationStatusStyles,
  applicationStatusIconStyles,
} from "@/constants/styles";
import { Icons } from "@/components/icons";
import { ApplicationStatusIconMap } from "@/constants/data";

interface JobApplicationDetailsCardProps {
  application: JobApplicationInterface;
  possibleStatuses: JobApplicationStatus[];
  statusLoading: boolean;
  onStatusChange: (status: string) => void;
  removePointerEventsFromBody: () => void;
}

export default function JobApplicationDetailsCard({
  application,
  possibleStatuses,
  statusLoading,
  onStatusChange,
  removePointerEventsFromBody,
}: JobApplicationDetailsCardProps) {
  const formattedAppliedDate = format(
    new Date(application.applied_at),
    "EEE dd MMM, yyyy hh:mm a"
  );
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
                  onClick={() => {
                    removePointerEventsFromBody();
                    onStatusChange(status.toString());
                  }}
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
    </Card>
  );
}
