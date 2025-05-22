"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, MoreHorizontal } from "lucide-react";
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
import {
  Domain,
  DomainLabels,
  JobDuration,
  JobDurationLabels,
} from "@/constants/system";
import { format } from "date-fns";
import { JobInterface } from "@/lib/interfaces";

export const columns: ColumnDef<JobInterface>[] = [
  {
    accessorKey: "title",
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
        {row.getValue("title")}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "domains",
    header: "Department",
    cell: ({ row }) => {
      const domains = row.getValue("domains") as Domain[];
      return (
        <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
          {domains.length > 0
            ? domains.map((domain) => DomainLabels[domain]).join(", ")
            : "Not specified"}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
        {row.getValue("location") || "Not specified"}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
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
    accessorKey: "posted",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Posted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
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
            <DropdownMenuItem>
              <Link
                href={`/career/jobs/${job.id}`}
                className="flex w-full items-center justify-start"
              >
                <Eye className="h-4 w-4 mr-2" />
                View job
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
