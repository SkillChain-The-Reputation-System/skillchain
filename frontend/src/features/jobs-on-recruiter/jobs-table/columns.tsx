"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { JobStatus, JobDuration, JobDurationLabels } from "@/constants/system";
import { format } from "date-fns";
import { JobPreviewInterface } from "@/lib/interfaces";
import { jobStatusHoverStyles } from "@/constants/styles";

export const columns: ColumnDef<JobPreviewInterface>[] = [
  {
    id: "select",
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }: { row: any }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "title",
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Job Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: any }) => (
      <div className="font-medium break-words line-clamp-2 overflow-hidden text-ellipsis">
        {row.getValue("title")}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }: { row: any }) => (
      <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
        {row.getValue("location")}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }: { row: any }) => {
      const durationEnum = row.getValue("duration") as JobDuration;
      return (
        <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
          {JobDurationLabels[durationEnum]}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "applicants",
    header: "Applicants",
    cell: ({ row }: { row: any }) => {
      const applicants = row.getValue("applicants") as number;
      return (
        <div className="overflow-hidden text-ellipsis">
          <Link
            href={`/recruiter/jobs/${row.original.id}/applicants`}
            className="text-blue-600 hover:text-blue-800 break-words"
          >
            {applicants} applicants
          </Link>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "posted",
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Posted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: any }) => {
      const posted = row.getValue("posted") as Date;
      return (
        <div className="break-words overflow-hidden text-ellipsis">
          {format(posted, "MMM d, yyyy")}
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "equals",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as JobStatus;

      let statusText = "";
      let badgeVariant = "";

      switch (status) {
        case JobStatus.DRAFT:
          statusText = "Draft";
          badgeVariant = jobStatusHoverStyles[JobStatus.DRAFT];
          break;
        case JobStatus.OPEN:
          statusText = "Open";
          badgeVariant = jobStatusHoverStyles[JobStatus.OPEN];
          break;
        case JobStatus.PAUSED:
          statusText = "Paused";
          badgeVariant = jobStatusHoverStyles[JobStatus.PAUSED];
          break;
        case JobStatus.CLOSED:
          statusText = "Closed";
          badgeVariant = jobStatusHoverStyles[JobStatus.CLOSED];
          break;
        case JobStatus.FILLED:
          statusText = "Filled";
          badgeVariant = jobStatusHoverStyles[JobStatus.FILLED];
          break;
        case JobStatus.ARCHIVED:
          statusText = "Archived";
          badgeVariant = jobStatusHoverStyles[JobStatus.ARCHIVED];
          break;
        default:
          statusText = "Unknown";
          badgeVariant = "bg-gray-100 text-gray-800";
      }
      return (
        <div className="overflow-hidden text-ellipsis">
          <Badge
            className={`${badgeVariant} font-medium text-xs`}
            variant="outline"
          >
            {statusText}
          </Badge>
        </div>
      );
    },
    size: 100,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: any }) => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.id.toString())}
            >
              <span className="text-sm cursor-pointer">Copy job ID</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/recruiter/jobs/${job.id}`} className="flex w-full">
                View job
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/recruiter/jobs/${job.id}/edit`}
                className="flex w-full"
              >
                Edit job
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={`/recruiter/jobs/${job.id}/applicants`}
                className="flex w-full"
              >
                View applicants
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
