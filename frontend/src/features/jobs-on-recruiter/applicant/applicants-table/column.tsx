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
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ApplicantColumns: ColumnDef<JobApplicantionInterface>[] = [
  {
    accessorKey: "profile_data.avatar_url",
    header: "Avatar",
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={row.original.profile_data?.avatar_url || ""}
            alt={row.original.profile_data?.fullname || "Applicant"}
          />
          <AvatarFallback>
            {row.original.profile_data?.fullname
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "AP"}
          </AvatarFallback>
        </Avatar>
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "profile_data.fullname",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Full Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.profile_data.fullname}</div>
    ),
    size: 160,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100 cursor-pointer"
              onClick={async () => {
                await navigator.clipboard.writeText(row.original.address);
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy address</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="font-medium truncate overflow-hidden whitespace-nowrap max-w-full cursor-default">
              {row.original.address}
            </div>
          </TooltipTrigger>
          <TooltipContent>{row.original.address}</TooltipContent>
        </Tooltip>
      </div>
    ),
    size: 200,
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
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
