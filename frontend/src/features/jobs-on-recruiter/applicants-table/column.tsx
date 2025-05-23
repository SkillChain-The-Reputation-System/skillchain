"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  JobApplicationStatus,
  ApplicationStatusLabels,
} from "@/constants/system";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { JobApplicantionInterface } from "@/lib/interfaces";
import { pageUrlMapping } from "@/constants/navigation";
import { applicationStatusStyles } from "@/constants/styles";

export const ApplicantColumns: ColumnDef<JobApplicantionInterface>[] = [  {
    accessorKey: "address",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Applicant
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="font-medium truncate overflow-hidden whitespace-nowrap max-w-full cursor-default">
            {row.original.address}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {row.original.address}
        </TooltipContent>
      </Tooltip>
    ),
    size: 160,
  },
  {
    accessorKey: "status",
    header: "Status",
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
      const appliedDate = new Date(appliedAt);
      return (
        <div className="break-words overflow-hidden text-ellipsis">
          {format(appliedDate, "MMM d, yyyy")}
        </div>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const applicant = row.original;

      const handleCopy = async () => {
        navigator.clipboard.writeText(applicant.address);
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
                href={`${pageUrlMapping.recruiter_jobs}/${applicant.job_id}/applicants/${applicant.id}`}
                className="flex w-full items-center justify-start"
              >
                View application
              </Link>
            </DropdownMenuItem>{" "}
            <DropdownMenuItem
              onClick={handleCopy}
              className="flex w-full items-center cursor-pointer justify-start"
            >
              Copy Address
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
