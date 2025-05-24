"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Domain,
  DomainLabels,
  JobDuration,
  JobDurationLabels,
  JobApplicationStatus,
  ApplicationStatusLabels,
} from "@/constants/system";
import { pageUrlMapping } from "@/constants/navigation";
import { format } from "date-fns";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";
import { Badge } from "@/components/ui/badge";
import { applicationStatusStyles } from "@/constants/styles";

export const ApplicationColumns: ColumnDef<JobApplicationWithJobDataInterface>[] = [
  {
    accessorKey: "job.title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Job Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium break-words line-clamp-2 overflow-hidden text-ellipsis">
        {row.original.job.title}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "job.duration",
    header: "Duration",
    cell: ({ row }) => {
      const durationEnum = row.original.job.duration as JobDuration;
      return (
        <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
          {JobDurationLabels[durationEnum]}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Application Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as JobApplicationStatus;
      const statusLabel = ApplicationStatusLabels[status];

      // Define status colors
      const getStatusColor = (status: JobApplicationStatus) => {
        return applicationStatusStyles[status];
      };

      return (
        <Badge className={`${getStatusColor(status)}`}>{statusLabel}</Badge>
      );
    },
    size: 150,
  },
  {
    accessorKey: "applied_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Applied Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const appliedAt = row.getValue("applied_at") as number;
      const appliedDate = new Date(appliedAt); // Convert from Unix timestamp
      return (
        <div className="break-words overflow-hidden text-ellipsis">
          {format(appliedDate, "MMM d, yyyy")}
        </div>
      );
    },
    size: 110,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const application = row.original;
      // Inline component to handle copy logic and feedback
      const handleCopy = async () => {
        navigator.clipboard.writeText(application.id);
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link
                href={`${pageUrlMapping.career_my_applications}/${application.id}`}
                className="flex w-full items-center justify-start"
              >
                View application
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCopy}
              className="flex items-center"
            >
              Copy Application ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
