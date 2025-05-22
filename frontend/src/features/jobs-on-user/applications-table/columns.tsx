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
import { JobApplicationInterface } from "@/lib/interfaces";
import { Badge } from "@/components/ui/badge";

export const ApplicationColumns: ColumnDef<JobApplicationInterface>[] = [
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
        switch (status) {
          case JobApplicationStatus.HIRED:
            return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300";
          case JobApplicationStatus.REJECTED:
            return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300";
          case JobApplicationStatus.WITHDRAWN:
            return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300";
          case JobApplicationStatus.PENDING:
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
          case JobApplicationStatus.SHORTLISTED:
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300";
          case JobApplicationStatus.INTERVIEWING:
            return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300";
          case JobApplicationStatus.REVIEWING:
            return "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300";
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300";
        }
      };
      
      return (
        <Badge className={`${getStatusColor(status)}`}>
          {statusLabel}
        </Badge>
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
                href={`${pageUrlMapping.career_available_jobs}/${application.job.id}`}
                className="flex w-full items-center justify-start"
              >
                <Eye className="h-4 w-4 mr-2" />
                View job details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
