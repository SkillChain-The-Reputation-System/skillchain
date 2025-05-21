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
import { JobStatus } from "@/constants/system";
import { format } from "date-fns";
import { JobInterface } from "@/lib/interfaces";

export const columns: ColumnDef<JobInterface>[] = [
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
  },
  {
    accessorKey: "title",
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Job Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: any }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }: { row: any }) => <div>{row.getValue("department")}</div>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }: { row: any }) => <div>{row.getValue("location")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: any }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "applicants",
    header: "Applicants",
    cell: ({ row }: { row: any }) => {
      const applicants = row.getValue("applicants") as number;
      return (
        <Link
          href={`/recruiter/jobs/${row.original.id}/applicants`}
          className="text-blue-600 hover:text-blue-800"
        >
          {applicants} applicants
        </Link>
      );
    },
  },
  {
    accessorKey: "posted",
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Posted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: any }) => {
      const posted = row.getValue("posted") as Date;
      return <div>{format(posted, "MMM d, yyyy")}</div>;
    },
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
          badgeVariant = "bg-gray-100 text-gray-800";
          break;
        case JobStatus.OPEN:
          statusText = "Open";
          badgeVariant = "bg-green-100 text-green-800";
          break;
        case JobStatus.PAUSED:
          statusText = "Paused";
          badgeVariant = "bg-yellow-100 text-yellow-800";
          break;
        case JobStatus.CLOSED:
          statusText = "Closed";
          badgeVariant = "bg-red-100 text-red-800";
          break;
        case JobStatus.FILLED:
          statusText = "Filled";
          badgeVariant = "bg-blue-100 text-blue-800";
          break;
        case JobStatus.ARCHIVED:
          statusText = "Archived";
          badgeVariant = "bg-slate-100 text-slate-800";
          break;
        default:
          statusText = "Unknown";
          badgeVariant = "bg-gray-100 text-gray-800";
      }

      return (
        <Badge className={`${badgeVariant} font-medium`} variant="outline">
          {statusText}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.id.toString())}
            >
              Copy job ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
  },
];
